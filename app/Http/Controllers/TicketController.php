<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTicketRequest;
use App\Models\Branch;
use App\Models\Module;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Services\TicketService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    protected $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Show the ticket creation form.
     */
    public function create(): Response
    {
        $branches = Branch::active()->get(['id', 'name', 'is_head_office']);
        $modules = Module::active()->get(['id', 'name']);

        return Inertia::render('Tickets/Create', [
            'branches' => $branches,
            'modules' => $modules,
        ]);
    }

    /**
     * Store a new ticket.
     */
    public function store(StoreTicketRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        
        // Sanitize AnyDesk code (remove spaces)
        if (!empty($validated['anydesk_code'])) {
            $validated['anydesk_code'] = preg_replace('/\s+/', '', $validated['anydesk_code']);
        }

        $ticket = Ticket::create([
            'created_by_user_id' => Auth::id(),
            'branch_id' => $validated['branch_id'],
            'module_id' => $validated['module_id'],
            'phone' => $validated['phone'],
            'issue_description' => $validated['issue_description'],
            'ip_address' => $validated['ip_address'] ?? null,
            'anydesk_code' => $validated['anydesk_code'] ?? null,
            'priority' => $validated['priority'] ?? 'MEDIUM',
            'status' => 'NEW',
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
                    'uploaded_by_user_id' => Auth::id(),
                ]);
            }
        }

        Log::info('Ticket created', ['ticket_no' => $ticket->ticket_no, 'user_id' => Auth::id()]);

        // Calculate SLA due dates
        $this->ticketService->calculateSlaDueDates($ticket);

        // Send ticket received notification
        $this->ticketService->sendReceivedNotification($ticket);

        return redirect()->route('my.tickets.show', $ticket)
            ->with('success', "Ticket {$ticket->ticket_no} has been submitted successfully!");
    }

    /**
     * Show user's own tickets.
     */
    public function myTickets(): Response
    {
        $tickets = Ticket::where('created_by_user_id', Auth::id())
            ->with(['branch:id,name', 'module:id,name'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('Tickets/MyTickets', [
            'tickets' => $tickets,
        ]);
    }

    /**
     * Show a specific ticket (user's own).
     */
    public function show(Ticket $ticket): Response
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'branch', 
            'module', 
            'creator', 
            'attachments',
            'comments' => function($q) {
                $q->where('visibility', 'PUBLIC')->with('user:id,name');
            }
        ]);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
        ]);
    }

    /**
     * User confirms ticket is fixed (RESOLVED -> CLOSED).
     */
    public function confirmFixed(Ticket $ticket): RedirectResponse
    {
        $this->authorize('update', $ticket);

        if ($ticket->status !== Ticket::STATUS_RESOLVED) {
            return back()->with('error', 'Ticket is not in Resolved status.');
        }

        $this->ticketService->changeStatus(
            $ticket, 
            Ticket::STATUS_CLOSED, 
            Auth::id(), 
            'User confirmed issue is fixed.'
        );

        return back()->with('success', 'Ticket closed. Thank you for your feedback!');
    }

    /**
     * User reports ticket is NOT fixed (RESOLVED -> IN_PROGRESS).
     */
    public function notFixed(Request $request, Ticket $ticket): RedirectResponse
    {
        $this->authorize('update', $ticket);

        if ($ticket->status !== Ticket::STATUS_RESOLVED) {
            return back()->with('error', 'Ticket is not in Resolved status.');
        }
        
        $request->validate(['note' => 'required|string|max:500']);

        $this->ticketService->changeStatus(
            $ticket, 
            Ticket::STATUS_IN_PROGRESS, 
            Auth::id(), 
            'User reported issue NOT fixed: ' . $request->note
        );

        return back()->with('success', 'Ticket reopened. We will investigate further.');
    }
}
