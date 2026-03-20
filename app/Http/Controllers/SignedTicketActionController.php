<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Services\TicketService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SignedTicketActionController extends Controller
{
    protected TicketService $ticketService;

    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Handle signed URL for confirming ticket is fixed.
     */
    public function confirmFixed(Request $request, Ticket $ticket)
    {
        // Verify signature
        if (!$request->hasValidSignature()) {
            abort(403, 'This link has expired or is invalid.');
        }

        // Check ticket status
        if ($ticket->status !== Ticket::STATUS_RESOLVED) {
            return view('tickets.action-result', [
                'success' => false,
                'ticket' => $ticket,
                'message' => 'This ticket is no longer in Resolved status.',
            ]);
        }

        // Perform the transition
        $this->ticketService->changeStatus(
            $ticket,
            Ticket::STATUS_CLOSED,
            $ticket->created_by_user_id,
            'User confirmed issue is fixed via email link.'
        );

        return view('tickets.action-result', [
            'success' => true,
            'ticket' => $ticket,
            'message' => 'Thank you! Your ticket has been closed.',
        ]);
    }

    /**
     * Handle signed URL for reporting ticket not fixed.
     */
    public function notFixed(Request $request, Ticket $ticket)
    {
        // Verify signature
        if (!$request->hasValidSignature()) {
            abort(403, 'This link has expired or is invalid.');
        }

        // Check ticket status
        if ($ticket->status !== Ticket::STATUS_RESOLVED) {
            return view('tickets.action-result', [
                'success' => false,
                'ticket' => $ticket,
                'message' => 'This ticket is no longer in Resolved status.',
            ]);
        }

        // Perform the transition
        $this->ticketService->changeStatus(
            $ticket,
            Ticket::STATUS_IN_PROGRESS,
            $ticket->created_by_user_id,
            'User reported issue NOT fixed via email link.'
        );

        return view('tickets.action-result', [
            'success' => true,
            'ticket' => $ticket,
            'message' => 'We\'ve reopened your ticket. Our team will investigate further.',
        ]);
    }
}
