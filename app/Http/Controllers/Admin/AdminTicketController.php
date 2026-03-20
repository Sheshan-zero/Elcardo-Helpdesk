<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Module;
use App\Models\Ticket;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\TicketAttachment;
use App\Services\TicketService;

class AdminTicketController extends Controller
{
    protected $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Display a listing of all tickets for admins.
     */
    public function index(Request $request): Response
    {
        $query = Ticket::with(['branch:id,name', 'module:id,name', 'creator:id,name', 'assignedAdmin:id,name']);

        // Apply filters
        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->branch_id);
        }

        if ($request->filled('module_id')) {
            $query->where('module_id', $request->module_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('assigned_admin_id')) {
            if ($request->assigned_admin_id === 'unassigned') {
                $query->whereNull('assigned_admin_id');
            } else {
                $query->where('assigned_admin_id', $request->assigned_admin_id);
            }
        }

        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
               $q->where('ticket_no', 'like', $searchTerm)
                 ->orWhere('issue_description', 'like', $searchTerm)
                 ->orWhere('status', 'like', $searchTerm)
                 ->orWhereHas('creator', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 })
                 ->orWhereHas('branch', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 })
                 ->orWhereHas('module', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 });
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(20)->withQueryString();

        // Get admins for filter
        $admins = User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN])->get(['id', 'name']);

        return Inertia::render('Admin/Tickets/Index', [
            'tickets' => $tickets,
            'branches' => Branch::active()->get(['id', 'name']),
            'modules' => Module::active()->get(['id', 'name']),
            'admins' => $admins,
            'filters' => $request->only(['branch_id', 'module_id', 'status', 'search', 'assigned_admin_id']),
        ]);
    }

    /**
     * Show the ticket creation form for admins.
     */
    public function create(): Response
    {
        $branches = Branch::active()->get(['id', 'name', 'is_head_office']);
        $modules = Module::active()->get(['id', 'name']);

        return Inertia::render('Admin/Tickets/Create', [
            'branches' => $branches,
            'modules' => $modules,
        ]);
    }

    /**
     * Search users for autocomplete.
     */
    public function searchUsers(Request $request)
    {
        $search = $request->get('q');
        
        $users = User::where('name', 'like', "%{$search}%")
            ->orWhere('email', 'like', "%{$search}%")
            ->limit(10)
            ->get(['id', 'name', 'email']);
            
        return response()->json($users);
    }

    /**
     * Store a new ticket on behalf of a user.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id',
            'new_user_name' => 'required_without:user_id|nullable|string|max:255',
            'new_user_email' => 'required_without:user_id|nullable|email|max:255',
            'branch_id' => 'required|exists:branches,id',
            'module_id' => 'required|exists:modules,id',
            'issue_description' => 'required|string',
            'ip_address' => 'nullable|ipv4',
            'anydesk_code' => 'nullable|string|max:20',
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'attachments.*' => 'nullable|file|max:10240',
        ]);

        $userId = $request->user_id;

        // Create temporary user if no existing user selected
        if (!$userId) {
            $user = User::firstOrCreate(
                ['email' => $validated['new_user_email']],
                [
                    'name' => $validated['new_user_name'],
                    'password' => Hash::make(Str::random(16)), // Secure random password
                    'role' => User::ROLE_USER
                ]
            );
            $userId = $user->id;
        }

        // Sanitize AnyDesk code
        if (!empty($validated['anydesk_code'])) {
            $validated['anydesk_code'] = preg_replace('/\s+/', '', $validated['anydesk_code']);
        }

        $ticket = Ticket::create([
            'created_by_user_id' => $userId,
            'branch_id' => $validated['branch_id'],
            'module_id' => $validated['module_id'],
            'phone' => 'N/A',
            'issue_description' => $validated['issue_description'],
            'ip_address' => $validated['ip_address'] ?? null,
            'anydesk_code' => $validated['anydesk_code'] ?? null,
            'priority' => $validated['priority'] ?? 'MEDIUM',
            'status' => Ticket::STATUS_NEW,
        ]);

        // Handle attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('tickets/' . $ticket->id, 'public');
                
                TicketAttachment::create([
                    'ticket_id' => $ticket->id,
                    'original_name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                    'uploaded_by_user_id' => Auth::id(), // Uploaded by the Admin
                ]);
            }
        }

        // Log creation
        \Illuminate\Support\Facades\Log::info('Admin created ticket on behalf of user', [
            'ticket_no' => $ticket->ticket_no,
            'admin_id' => Auth::id(),
            'user_id' => $userId
        ]);

        // Calculate SLA due dates
        $this->ticketService->calculateSlaDueDates($ticket);

        // Send ticket received notification to user
        $this->ticketService->sendReceivedNotification($ticket);

        return redirect()->route('admin.tickets.show', $ticket)
            ->with('success', "Ticket {$ticket->ticket_no} created successfully for user.");
    }

    /**
     * Display the specified ticket.
     */
    public function show(Ticket $ticket): Response
    {
        $ticket->load([
            'branch', 
            'module', 
            'creator', 
            'attachments', 
            'assignedAdmin',
            'history.user',
            'comments.user',
            'notificationLogs'
        ]);

        $admins = User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN])->get(['id', 'name']);

        return Inertia::render('Admin/Tickets/Show', [
            'ticket' => $ticket,
            'admins' => $admins,
            'statuses' => [
                Ticket::STATUS_NEW,
                Ticket::STATUS_ASSIGNED,
                Ticket::STATUS_IN_PROGRESS,
                Ticket::STATUS_WAITING_USER,
                Ticket::STATUS_WAITING_VENDOR,
                Ticket::STATUS_RESOLVED,
                Ticket::STATUS_CLOSED,
            ],
        ]);
    }

    public function updateStatus(Request $request, Ticket $ticket): RedirectResponse
    {
        $request->validate([
            'status' => 'required|string',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $this->ticketService->changeStatus(
                $ticket, 
                $request->status, 
                $request->user()->id, 
                $request->note
            );
            return back()->with('success', 'Ticket status updated.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function assignUser(Request $request, Ticket $ticket): RedirectResponse
    {
        $request->validate([
            'assigned_admin_id' => 'nullable|exists:users,id',
        ]);

        // Verify the user being assigned is an admin?
        // Logic handled in service or explicit check here. Service expects ID.
        
        $this->ticketService->assignTicket(
            $ticket, 
            $request->assigned_admin_id, 
            $request->user()->id
        );

        return back()->with('success', 'Ticket assignment updated.');
    }

    public function updatePriority(Request $request, Ticket $ticket): RedirectResponse
    {
        $request->validate([
            'priority' => 'required|in:LOW,MEDIUM,HIGH,URGENT',
            'note' => 'nullable|string|max:500',
        ]);

        $oldPriority = $ticket->priority ?? 'MEDIUM';
        $newPriority = $request->priority;

        // Update priority
        $ticket->priority = $newPriority;
        $ticket->save();

        // Recalculate SLA due dates based on new priority
        app(\App\Services\SlaService::class)->calculateDueDates($ticket);

        // Log the change in ticket history
        $note = $request->note 
            ? "Priority changed from {$oldPriority} to {$newPriority}. Note: {$request->note}"
            : "Priority changed from {$oldPriority} to {$newPriority}.";

        \App\Models\TicketStatusHistory::create([
            'ticket_id' => $ticket->id,
            'changed_by_user_id' => $request->user()->id,
            'from_status' => $ticket->status,
            'to_status' => $ticket->status,
            'note' => $note,
        ]);

        return back()->with('success', 'Ticket priority updated.');
    }

    public function kanban(Request $request): Response
    {
        // Fetch tickets, perhaps optimized for Kanban (fewer fields, eager load relations)
        // We might want to filter out old CLOSED tickets to keep performance high
        
        $query = Ticket::with([
            'branch:id,name', 
            'module:id,name', 
            'creator:id,name', 
            'assignedAdmin:id,name'
        ]);

        // Apply filters (reused)
        if ($request->filled('branch_id')) $query->where('branch_id', $request->branch_id);
        if ($request->filled('module_id')) $query->where('module_id', $request->module_id);
        if ($request->filled('search')) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
               $q->where('ticket_no', 'like', $searchTerm)
                 ->orWhere('issue_description', 'like', $searchTerm)
                 ->orWhere('status', 'like', $searchTerm)
                 ->orWhereHas('creator', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 })
                 ->orWhereHas('branch', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 })
                 ->orWhereHas('module', function ($q2) use ($searchTerm) {
                     $q2->where('name', 'like', $searchTerm);
                 });
            });
        }
        if ($request->filled('assigned_admin_id')) {
            if ($request->assigned_admin_id === 'unassigned') {
                $query->whereNull('assigned_admin_id');
            } else {
                $query->where('assigned_admin_id', $request->assigned_admin_id);
            }
        }

        // Exclude CLOSED tickets older than 7 days if no search is active
        if (!$request->filled('search') && !$request->filled('status')) {
             $query->where(function($q) {
                 $q->where('status', '!=', Ticket::STATUS_CLOSED)
                   ->orWhere('updated_at', '>=', now()->subDays(7));
             });
        }

        $tickets = $query->orderBy('updated_at', 'desc')->get();

        $admins = User::whereIn('role', [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN])->get(['id', 'name']);

        return Inertia::render('Admin/Tickets/Kanban', [
            'tickets' => $tickets, // Frontend will group them
            'branches' => Branch::active()->get(['id', 'name']),
            'modules' => Module::active()->get(['id', 'name']),
            'admins' => $admins,
            'filters' => $request->only(['branch_id', 'module_id', 'search', 'assigned_admin_id']),
        ]);
    }
}
