<?php

namespace App\Console\Commands;

use App\Models\ReminderLog;
use App\Models\Ticket;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendOverdueReminders extends Command
{
    protected $signature = 'sla:send-reminders {--interval=4 : Hours between reminders per ticket}';
    protected $description = 'Send reminder emails for overdue tickets';

    public function handle(): int
    {
        $intervalHours = (int) $this->option('interval');
        $sentCount = 0;

        // Find tickets with breached first response (no admin action yet)
        $frOverdue = Ticket::with(['branch:id,name', 'module:id,name', 'assignedAdmin:id,name,email'])
            ->whereNotNull('first_response_due_at')
            ->whereNull('first_admin_action_at')
            ->where('first_response_due_at', '<', now())
            ->where('status', '!=', Ticket::STATUS_CLOSED)
            ->get();

        foreach ($frOverdue as $ticket) {
            $sentCount += $this->sendAdminReminder($ticket, ReminderLog::TYPE_ADMIN_OVERDUE, $intervalHours);
        }

        // Find tickets with breached resolution SLA
        $resOverdue = Ticket::with(['branch:id,name', 'module:id,name', 'assignedAdmin:id,name,email'])
            ->whereNotNull('resolution_due_at')
            ->whereNull('resolved_at')
            ->where('resolution_due_at', '<', now())
            ->where('status', '!=', Ticket::STATUS_CLOSED)
            ->get();

        foreach ($resOverdue as $ticket) {
            $sentCount += $this->sendAdminReminder($ticket, ReminderLog::TYPE_RESOLUTION_OVERDUE, $intervalHours);
        }

        // User waiting reminders
        $waitingTickets = Ticket::with(['creator:id,name,email', 'branch:id,name', 'module:id,name'])
            ->where('status', Ticket::STATUS_WAITING_USER)
            ->where('updated_at', '<', now()->subHours(24))
            ->get();

        foreach ($waitingTickets as $ticket) {
            $sentCount += $this->sendUserWaitingReminder($ticket);
        }

        $this->info("Sent {$sentCount} reminder(s).");
        return self::SUCCESS;
    }

    protected function sendAdminReminder(Ticket $ticket, string $type, int $intervalHours): int
    {
        // Anti-spam check
        if (ReminderLog::wasRecentlySent($ticket->id, $type, $intervalHours)) {
            return 0;
        }

        // Determine recipient
        $recipient = null;
        if ($ticket->assignedAdmin) {
            $recipient = $ticket->assignedAdmin->email;
        } else {
            // Fall back to first super admin
            $superAdmin = User::where('role', User::ROLE_SUPER_ADMIN)->first();
            $recipient = $superAdmin?->email;
        }

        if (!$recipient) {
            return 0;
        }

        try {
            $overdueType = $type === ReminderLog::TYPE_ADMIN_OVERDUE 
                ? 'First Response' : 'Resolution';
            $ageHours = now()->diffInHours($ticket->created_at);
            $ticketUrl = url("/admin/tickets/{$ticket->id}");

            Mail::raw(
                "⚠️ OVERDUE TICKET REMINDER\n\n" .
                "Ticket: {$ticket->ticket_no}\n" .
                "SLA Type: {$overdueType}\n" .
                "Branch: " . ($ticket->branch?->name ?? 'N/A') . "\n" .
                "Module: " . ($ticket->module?->name ?? 'N/A') . "\n" .
                "Status: {$ticket->status}\n" .
                "Age: {$ageHours} hours\n\n" .
                "Open ticket: {$ticketUrl}\n",
                function ($message) use ($recipient, $ticket, $overdueType) {
                    $message->to($recipient)
                        ->subject("⚠️ Overdue: {$ticket->ticket_no} - {$overdueType} SLA Breached");
                }
            );

            ReminderLog::logSent($ticket->id, $type, $recipient);
            return 1;
        } catch (\Exception $e) {
            ReminderLog::logFailed($ticket->id, $type, $recipient, $e->getMessage());
            return 0;
        }
    }

    protected function sendUserWaitingReminder(Ticket $ticket): int
    {
        if (ReminderLog::wasRecentlySent($ticket->id, ReminderLog::TYPE_USER_WAITING, 24)) {
            return 0;
        }

        $recipient = $ticket->creator?->email;
        if (!$recipient) {
            return 0;
        }

        try {
            $ticketUrl = url("/tickets/{$ticket->id}");

            Mail::raw(
                "Hello,\n\n" .
                "Your ticket {$ticket->ticket_no} is waiting for your response.\n" .
                "The IT team needs additional information to proceed.\n\n" .
                "Please reply or update your ticket: {$ticketUrl}\n",
                function ($message) use ($recipient, $ticket) {
                    $message->to($recipient)
                        ->subject("Action Required: {$ticket->ticket_no} - Waiting for Your Response");
                }
            );

            ReminderLog::logSent($ticket->id, ReminderLog::TYPE_USER_WAITING, $recipient);
            return 1;
        } catch (\Exception $e) {
            ReminderLog::logFailed($ticket->id, ReminderLog::TYPE_USER_WAITING, $recipient, $e->getMessage());
            return 0;
        }
    }
}
