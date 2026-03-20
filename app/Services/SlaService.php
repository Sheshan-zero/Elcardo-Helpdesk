<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\SlaPolicy;
use App\Models\User;
use Carbon\Carbon;

class SlaService
{
    /**
     * Calculate and set SLA due dates on a ticket.
     * Called when a ticket is created or when priority/module/branch changes.
     */
    public function calculateDueDates(Ticket $ticket): void
    {
        $policy = SlaPolicy::findMatchingPolicy($ticket);

        if (!$policy) {
            return; // No SLA policy applies
        }

        $createdAt = $ticket->created_at ?? now();

        if ($policy->first_response_minutes) {
            $ticket->first_response_due_at = $createdAt->copy()->addMinutes($policy->first_response_minutes);
        }

        if ($policy->resolution_minutes) {
            $ticket->resolution_due_at = $createdAt->copy()->addMinutes($policy->resolution_minutes);
        }

        $ticket->saveQuietly(); // Save without triggering events
    }

    /**
     * Record the first admin action on a ticket.
     * Called when an admin posts a comment, changes status, or assigns the ticket.
     */
    public function recordFirstAdminAction(Ticket $ticket, int $userId): void
    {
        // Only record once
        if ($ticket->first_admin_action_at) {
            return;
        }

        // Verify user is admin
        $user = User::find($userId);
        if (!$user || !in_array($user->role, [User::ROLE_ADMIN, User::ROLE_SUPER_ADMIN])) {
            return;
        }

        $ticket->first_admin_action_at = now();

        // Check if first response SLA was breached
        if ($ticket->first_response_due_at && now()->greaterThan($ticket->first_response_due_at)) {
            $ticket->first_response_breached_at = $ticket->first_response_due_at;
        }

        $ticket->saveQuietly();
    }

    /**
     * Check and record SLA breaches for all open tickets.
     * Called by the scheduled CheckSlaBreachesJob.
     */
    public function checkAllBreaches(): int
    {
        $breachCount = 0;

        // Check first response breaches
        $frTickets = Ticket::whereNotNull('first_response_due_at')
            ->whereNull('first_admin_action_at')
            ->whereNull('first_response_breached_at')
            ->where('first_response_due_at', '<', now())
            ->where('status', '!=', Ticket::STATUS_CLOSED)
            ->get();

        foreach ($frTickets as $ticket) {
            $ticket->first_response_breached_at = $ticket->first_response_due_at;
            $ticket->saveQuietly();
            $breachCount++;
        }

        // Check resolution breaches
        $resTickets = Ticket::whereNotNull('resolution_due_at')
            ->whereNull('resolved_at')
            ->whereNull('resolution_breached_at')
            ->where('resolution_due_at', '<', now())
            ->where('status', '!=', Ticket::STATUS_CLOSED)
            ->get();

        foreach ($resTickets as $ticket) {
            $ticket->resolution_breached_at = $ticket->resolution_due_at;
            $ticket->saveQuietly();
            $breachCount++;
        }

        return $breachCount;
    }

    /**
     * Recalculate SLA due dates for existing tickets that don't have them yet.
     * Useful after creating SLA policies retroactively.
     */
    public function backfillDueDates(): int
    {
        $count = 0;

        $tickets = Ticket::whereNull('first_response_due_at')
            ->whereNull('resolution_due_at')
            ->where('status', '!=', Ticket::STATUS_CLOSED)
            ->get();

        foreach ($tickets as $ticket) {
            $policy = SlaPolicy::findMatchingPolicy($ticket);
            if ($policy) {
                $this->calculateDueDates($ticket);
                $count++;
            }
        }

        return $count;
    }
}
