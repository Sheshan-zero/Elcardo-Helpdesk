<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Exception;

class TicketService
{
    protected NotificationService $notificationService;
    protected SlaService $slaService;

    public function __construct(NotificationService $notificationService, SlaService $slaService)
    {
        $this->notificationService = $notificationService;
        $this->slaService = $slaService;
    }

    /**
     * Change the status of a ticket and log the history.
     */
    public function changeStatus(Ticket $ticket, string $newStatus, int $userId, ?string $note = null): void
    {
        if ($ticket->status === $newStatus) {
            return;
        }

        if (!$ticket->canTransitionTo($newStatus)) {
            throw new Exception("Invalid status transition from {$ticket->status} to {$newStatus}");
        }

        DB::transaction(function () use ($ticket, $newStatus, $userId, $note) {
            $oldStatus = $ticket->status;
            $ticket->status = $newStatus;

            if ($newStatus === Ticket::STATUS_RESOLVED) {
                $ticket->resolved_at = now();
            }
            if ($newStatus === Ticket::STATUS_CLOSED) {
                $ticket->closed_at = now();
            }
            // If reopening from CLOSED
            if ($oldStatus === Ticket::STATUS_CLOSED && in_array($newStatus, [Ticket::STATUS_IN_PROGRESS, Ticket::STATUS_ASSIGNED])) {
                $ticket->closed_at = null;
            }

            $ticket->save();

            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'from_status' => $oldStatus,
                'to_status' => $newStatus,
                'changed_by_user_id' => $userId,
                'note' => $note,
            ]);
        });

        // Record first admin action for SLA tracking
        $this->slaService->recordFirstAdminAction($ticket, $userId);

        // Send notification after transaction completes
        $this->sendStatusNotification($ticket, $newStatus);
    }

    /**
     * Send notification for status change.
     */
    protected function sendStatusNotification(Ticket $ticket, string $status): void
    {
        $key = NotificationService::getKeyForStatus($status);
        if ($key) {
            $ticket->load(['branch', 'module', 'creator', 'assignedAdmin']);
            $this->notificationService->sendNotification($ticket, $key);
        }
    }

    /**
     * Assign a ticket to an admin.
     */
    public function assignTicket(Ticket $ticket, ?int $adminId, int $userId): void
    {
        if ($ticket->assigned_admin_id === $adminId) {
            return;
        }

        DB::transaction(function () use ($ticket, $adminId, $userId) {
            $ticket->assigned_admin_id = $adminId;
            
            // If currently NEW and being assigned -> move to ASSIGNED
            if ($adminId && $ticket->status === Ticket::STATUS_NEW) {
                // This handles the save inside changeStatus
                $this->changeStatus($ticket, Ticket::STATUS_ASSIGNED, $userId, 'Auto-assigned upon admin allocation');
            } else {
                $ticket->save();
                
                // Log assignment change in history even if status doesn't change
                $adminName = $adminId ? User::find($adminId)?->name : 'Unassigned';
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'from_status' => $ticket->status,
                    'to_status' => $ticket->status,
                    'changed_by_user_id' => $userId,
                    'note' => "Assigned to: $adminName",
                ]);
            }
        });

        // Record first admin action for SLA (assignment counts as admin action)
        if ($adminId) {
            $this->slaService->recordFirstAdminAction($ticket, $userId);
        }
    }

    /**
     * Send ticket received notification.
     */
    public function sendReceivedNotification(Ticket $ticket): void
    {
        $ticket->load(['branch', 'module', 'creator']);
        $this->notificationService->sendNotification($ticket, 'ticket_received');
    }

    /**
     * Calculate SLA due dates for a ticket.
     */
    public function calculateSlaDueDates(Ticket $ticket): void
    {
        $this->slaService->calculateDueDates($ticket);
    }
}

