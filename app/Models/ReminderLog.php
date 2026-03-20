<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReminderLog extends Model
{
    protected $table = 'reminders_log';

    const TYPE_ADMIN_OVERDUE = 'ADMIN_OVERDUE';
    const TYPE_USER_WAITING = 'USER_WAITING';
    const TYPE_RESOLUTION_OVERDUE = 'RESOLUTION_OVERDUE';

    const STATUS_SENT = 'SENT';
    const STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'ticket_id',
        'reminder_type',
        'channel',
        'recipient',
        'status',
        'sent_at',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Check if a reminder was sent recently for this ticket/type.
     */
    public static function wasRecentlySent(int $ticketId, string $type, int $withinHours = 4): bool
    {
        return self::where('ticket_id', $ticketId)
            ->where('reminder_type', $type)
            ->where('status', self::STATUS_SENT)
            ->where('sent_at', '>=', now()->subHours($withinHours))
            ->exists();
    }

    /**
     * Log a sent reminder.
     */
    public static function logSent(int $ticketId, string $type, string $recipient): self
    {
        return self::create([
            'ticket_id' => $ticketId,
            'reminder_type' => $type,
            'channel' => 'EMAIL',
            'recipient' => $recipient,
            'status' => self::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    /**
     * Log a failed reminder.
     */
    public static function logFailed(int $ticketId, string $type, string $recipient, string $error): self
    {
        return self::create([
            'ticket_id' => $ticketId,
            'reminder_type' => $type,
            'channel' => 'EMAIL',
            'recipient' => $recipient,
            'status' => self::STATUS_FAILED,
            'sent_at' => now(),
            'error_message' => $error,
        ]);
    }
}
