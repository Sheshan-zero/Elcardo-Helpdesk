<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Ticket extends Model
{
    use HasFactory;

    const STATUS_NEW = 'NEW';
    const STATUS_ASSIGNED = 'ASSIGNED';
    const STATUS_IN_PROGRESS = 'IN_PROGRESS';
    const STATUS_WAITING_USER = 'WAITING_USER';
    const STATUS_WAITING_VENDOR = 'WAITING_VENDOR';
    const STATUS_RESOLVED = 'RESOLVED';
    const STATUS_CLOSED = 'CLOSED';

    const PRIORITY_LOW = 'LOW';
    const PRIORITY_MEDIUM = 'MEDIUM';
    const PRIORITY_HIGH = 'HIGH';
    const PRIORITY_URGENT = 'URGENT';

    protected $fillable = [
        'ticket_no',
        'created_by_user_id',
        'branch_id',
        'module_id',
        'phone',
        'issue_description',
        'ip_address',
        'anydesk_code',
        'status',
        'assigned_admin_id',
        'priority',
        'resolved_at',
        'closed_at',
        'first_admin_action_at',
        'first_response_due_at',
        'resolution_due_at',
        'first_response_breached_at',
        'resolution_breached_at',
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'closed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'first_admin_action_at' => 'datetime',
        'first_response_due_at' => 'datetime',
        'resolution_due_at' => 'datetime',
        'first_response_breached_at' => 'datetime',
        'resolution_breached_at' => 'datetime',
    ];

    /**
     * Check if first response SLA is breached.
     */
    public function isFirstResponseOverdue(): bool
    {
        if (!$this->first_response_due_at) return false;
        if ($this->first_admin_action_at) return false; // Already responded
        return now()->greaterThan($this->first_response_due_at);
    }

    /**
     * Check if resolution SLA is breached.
     */
    public function isResolutionOverdue(): bool
    {
        if (!$this->resolution_due_at) return false;
        if ($this->resolved_at) return false; // Already resolved
        return now()->greaterThan($this->resolution_due_at);
    }

    protected static function booted(): void
    {
        static::creating(function (Ticket $ticket) {
            if (empty($ticket->ticket_no)) {
                $ticket->ticket_no = self::generateTicketNumber();
            }
            if (empty($ticket->status)) {
                $ticket->status = self::STATUS_NEW;
            }
        });
    }

    public static function generateTicketNumber(): string
    {
        return DB::transaction(function () {
            $lastTicket = self::lockForUpdate()->orderBy('id', 'desc')->first();
            
            if ($lastTicket) {
                $lastNumber = (int) substr($lastTicket->ticket_no, 4);
                $newNumber = $lastNumber + 1;
            } else {
                $newNumber = 1;
            }
            
            return 'ELC-' . str_pad($newNumber, 6, '0', STR_PAD_LEFT);
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function assignedAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_admin_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(TicketAttachment::class);
    }

    public function history(): HasMany
    {
        return $this->hasMany(TicketStatusHistory::class)->orderBy('created_at', 'desc');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at', 'asc');
    }

    public function vendors()
    {
        return $this->belongsToMany(Vendor::class, 'ticket_vendors')
            ->withPivot('status', 'reference_no')
            ->withTimestamps();
    }

    public function assets()
    {
        return $this->belongsToMany(Asset::class, 'asset_ticket');
    }

    public function notificationLogs(): HasMany
    {
        return $this->hasMany(TicketNotificationLog::class)->orderBy('created_at', 'desc');
    }

    public static function validTransitions(): array
    {
        // Admins can move forward normally, and backward with a note (enforced by frontend)
        return [
            self::STATUS_NEW => [self::STATUS_ASSIGNED],
            self::STATUS_ASSIGNED => [self::STATUS_NEW, self::STATUS_IN_PROGRESS, self::STATUS_WAITING_USER, self::STATUS_WAITING_VENDOR, self::STATUS_RESOLVED],
            self::STATUS_IN_PROGRESS => [self::STATUS_ASSIGNED, self::STATUS_WAITING_USER, self::STATUS_WAITING_VENDOR, self::STATUS_RESOLVED],
            self::STATUS_WAITING_USER => [self::STATUS_ASSIGNED, self::STATUS_IN_PROGRESS, self::STATUS_RESOLVED],
            self::STATUS_WAITING_VENDOR => [self::STATUS_ASSIGNED, self::STATUS_IN_PROGRESS, self::STATUS_RESOLVED],
            self::STATUS_RESOLVED => [self::STATUS_ASSIGNED, self::STATUS_IN_PROGRESS, self::STATUS_CLOSED],
            self::STATUS_CLOSED => [self::STATUS_ASSIGNED, self::STATUS_IN_PROGRESS], // Reopening
        ];
    }

    public function canTransitionTo(string $newStatus): bool
    {
        if ($this->status === $newStatus) {
            return true;
        }

        $validTransitions = self::validTransitions();
        return in_array($newStatus, $validTransitions[$this->status] ?? []);
    }
}
