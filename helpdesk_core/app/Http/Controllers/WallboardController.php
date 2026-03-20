<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\WallboardSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WallboardController extends Controller
{
    /**
     * Display the wallboard page.
     */
    public function index(Request $request): Response
    {
        // Verify signed URL
        if (!$request->hasValidSignature()) {
            abort(403, 'Invalid or expired wallboard link.');
        }

        $settings = WallboardSetting::getAllSettings();
        $defaults = WallboardSetting::getDefaults();
        
        // Merge with defaults
        $settings = array_merge($defaults, $settings);

        return Inertia::render('Wallboard/Index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Get wallboard ticket data (API endpoint).
     */
    public function tickets(Request $request): JsonResponse
    {
        // Verify signed URL or allow from wallboard page
        if (!$request->hasValidSignature() && !$request->header('X-Wallboard-Request')) {
            abort(403, 'Invalid request.');
        }

        $settings = WallboardSetting::getAllSettings();
        $defaults = WallboardSetting::getDefaults();
        $settings = array_merge($defaults, $settings);

        // Build query
        $query = Ticket::with(['branch:id,name', 'module:id,name', 'assignedAdmin:id,name', 'creator:id,name']);

        // Branch filter
        if (!empty($settings['branch_filter'])) {
            $query->where('branch_id', $settings['branch_filter']);
        }

        // Get visible columns
        $visibleColumns = $settings['visible_columns'] ?? $defaults['visible_columns'];

        // Filter by visible statuses only
        $query->whereIn('status', $visibleColumns);

        // Order by priority (if exists) then by age
        $query->orderByRaw("CASE 
            WHEN priority = 'URGENT' THEN 1 
            WHEN priority = 'HIGH' THEN 2 
            WHEN priority = 'NORMAL' THEN 3 
            ELSE 4 
        END")
        ->orderBy('created_at', 'asc');

        // Limit for performance
        $tickets = $query->limit(200)->get();

        // Group tickets by status
        $columns = [];
        foreach ($visibleColumns as $status) {
            $columns[$status] = [];
        }

        foreach ($tickets as $ticket) {
            if (isset($columns[$ticket->status])) {
                $columns[$ticket->status][] = $this->sanitizeTicket($ticket, $settings);
            }
        }

        // Limit per column (top 30 per column for TV performance)
        foreach ($columns as $status => $statusTickets) {
            $columns[$status] = array_slice($statusTickets, 0, 30);
        }

        return response()->json([
            'generated_at' => now()->toIso8601String(),
            'columns' => $columns,
            'settings' => [
                'warn_hours' => $settings['warn_hours'],
                'critical_hours' => $settings['critical_hours'],
                'show_admin_name' => $settings['show_admin_name'],
                'show_remote_badges' => $settings['show_remote_badges'],
            ],
        ]);
    }

    /**
     * Sanitize ticket data for wallboard (privacy).
     */
    protected function sanitizeTicket(Ticket $ticket, array $settings): array
    {
        $data = [
            'id' => $ticket->id,
            'ticket_no' => $ticket->ticket_no,
            'branch' => $ticket->branch?->name ?? 'N/A',
            'module' => $ticket->module?->name ?? 'N/A',
            'status' => $ticket->status,
            'priority' => $ticket->priority ?? 'NORMAL',
            'created_at' => $ticket->created_at->toIso8601String(),
            'has_ip' => !empty($ticket->ip_address),
            'has_anydesk' => !empty($ticket->anydesk_code),
        ];

        // User display based on settings
        $userDisplay = $settings['user_display'] ?? 'initials';
        if ($userDisplay === 'full') {
            $data['user_name'] = $ticket->creator?->name ?? 'Unknown';
        } elseif ($userDisplay === 'initials') {
            $name = $ticket->creator?->name ?? '';
            $parts = explode(' ', $name);
            if (count($parts) >= 2) {
                $data['user_name'] = strtoupper(substr($parts[0], 0, 1)) . '. ' . $parts[count($parts) - 1];
            } else {
                $data['user_name'] = strtoupper(substr($name, 0, 1)) . '.';
            }
        } else {
            $data['user_name'] = null;
        }

        // Admin name
        if ($settings['show_admin_name'] ?? true) {
            $data['admin_name'] = $ticket->assignedAdmin?->name ?? null;
        } else {
            $data['admin_name'] = null;
        }

        return $data;
    }
}
