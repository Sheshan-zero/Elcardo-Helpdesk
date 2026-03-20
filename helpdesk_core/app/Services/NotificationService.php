<?php

namespace App\Services;

use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use App\Models\Ticket;
use App\Models\TicketNotificationLog;
use App\Jobs\SendTicketEmail;
use Illuminate\Support\Facades\URL;

class NotificationService
{
    /**
     * Check if a notification type is enabled.
     */
    public function isEnabled(string $key): bool
    {
        return NotificationSetting::isEnabled($key);
    }

    /**
     * Get template by key.
     */
    public function getTemplate(string $key): ?EmailTemplate
    {
        return EmailTemplate::where('key', $key)->first();
    }

    /**
     * Send notification for a ticket event.
     */
    public function sendNotification(Ticket $ticket, string $key): ?TicketNotificationLog
    {
        $log = null;

        // Try standard notification (to creator) -> original behavior
        if ($this->isEnabled($key)) {
            $template = $this->getTemplate($key);
            if ($template && isset($ticket->creator->email)) {
                $variables = $this->buildVariables($ticket, $key);
                $rendered = $template->render($variables);
                
                $log = TicketNotificationLog::create([
                    'ticket_id' => $ticket->id,
                    'key' => $key,
                    'recipient_email' => $ticket->creator->email,
                    'subject' => $rendered['subject'],
                    'status' => TicketNotificationLog::STATUS_QUEUED,
                ]);
                SendTicketEmail::dispatch($log, $rendered['body'], $rendered['is_html']);
            }
        }

        // Additional admin notifications logic
        if ($key === 'ticket_received' && $this->isEnabled('admin_ticket_received')) {
            $adminTemplate = $this->getTemplate('admin_ticket_received');
            if ($adminTemplate) {
                // Fetch all admins and super admins
                $admins = \App\Models\User::whereIn('role', [\App\Models\User::ROLE_ADMIN, \App\Models\User::ROLE_SUPER_ADMIN])->get();
                $variables = $this->buildVariables($ticket, 'admin_ticket_received');
                $rendered = $adminTemplate->render($variables);

                foreach ($admins as $admin) {
                    if ($admin->email) {
                        $adminLog = TicketNotificationLog::create([
                            'ticket_id' => $ticket->id,
                            'key' => 'admin_ticket_received',
                            'recipient_email' => $admin->email,
                            'subject' => $rendered['subject'],
                            'status' => TicketNotificationLog::STATUS_QUEUED,
                        ]);
                        SendTicketEmail::dispatch($adminLog, $rendered['body'], $rendered['is_html']);
                    }
                }
            }
        }

        if ($key === 'ticket_assigned' && $this->isEnabled('admin_ticket_assigned')) {
            $adminTemplate = $this->getTemplate('admin_ticket_assigned');
            // If ticket is assigned to someone, notify them
            if ($adminTemplate && $ticket->assignedAdmin && $ticket->assignedAdmin->email) {
                $variables = $this->buildVariables($ticket, 'admin_ticket_assigned');
                $rendered = $adminTemplate->render($variables);
                
                $adminLog = TicketNotificationLog::create([
                    'ticket_id' => $ticket->id,
                    'key' => 'admin_ticket_assigned',
                    'recipient_email' => $ticket->assignedAdmin->email,
                    'subject' => $rendered['subject'],
                    'status' => TicketNotificationLog::STATUS_QUEUED,
                ]);
                SendTicketEmail::dispatch($adminLog, $rendered['body'], $rendered['is_html']);
            }
        }

        return $log;
    }

    /**
     * Build template variables for a ticket.
     */
    protected function buildVariables(Ticket $ticket, string $key): array
    {
        $variables = [
            'ticket_no' => $ticket->ticket_no,
            'branch' => $ticket->branch->name ?? 'N/A',
            'module' => $ticket->module->name ?? 'N/A',
            'status' => $ticket->status,
            'issue_summary' => \Illuminate\Support\Str::limit($ticket->issue_description, 100),
            'ticket_url' => route('my.tickets.show', $ticket),
            'assigned_admin_name' => $ticket->assignedAdmin->name ?? 'Unassigned',
            'creator_name' => $ticket->creator->name ?? 'Unknown',
            'priority' => $ticket->priority,
            'ticket_view_url' => route('admin.tickets.show', $ticket),
        ];

        // Add signed action URLs for resolved template
        if ($key === 'ticket_resolved') {
            $variables['fixed_url'] = URL::temporarySignedRoute(
                'tickets.confirmFixed.signed',
                now()->addDays(7),
                ['ticket' => $ticket->id]
            );
            $variables['not_fixed_url'] = URL::temporarySignedRoute(
                'tickets.notFixed.signed',
                now()->addDays(7),
                ['ticket' => $ticket->id]
            );
        }

        return $variables;
    }

    /**
     * Get the notification key for a status change.
     */
    public static function getKeyForStatus(string $status): ?string
    {
        $map = [
            Ticket::STATUS_ASSIGNED => 'ticket_assigned',
            Ticket::STATUS_IN_PROGRESS => 'ticket_in_progress',
            Ticket::STATUS_RESOLVED => 'ticket_resolved',
            Ticket::STATUS_CLOSED => 'ticket_closed',
        ];

        return $map[$status] ?? null;
    }
}
