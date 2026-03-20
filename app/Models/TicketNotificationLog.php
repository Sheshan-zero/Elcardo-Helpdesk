<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TicketNotificationLog extends Model
{
    use HasFactory;

    protected $table = 'ticket_notifications_log';

    protected $fillable = [
        'ticket_id',
        'key',
        'recipient_email',
        'subject',
        'status',
        'error_message',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    const STATUS_QUEUED = 'QUEUED';
    const STATUS_SENT = 'SENT';
    const STATUS_FAILED = 'FAILED';

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function markAsSent(): void
    {
        $this->update([
            'status' => self::STATUS_SENT,
            'sent_at' => now(),
        ]);
    }

    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'error_message' => $errorMessage,
        ]);
    }
}
