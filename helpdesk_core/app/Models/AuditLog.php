<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['actor_user_id', 'action', 'target_type', 'target_id', 'meta', 'created_at'];

    protected $casts = [
        'meta' => 'array',
        'created_at' => 'datetime',
    ];

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }

    public function target()
    {
        return $this->morphTo('target', 'target_type', 'target_id');
    }

    /**
     * Record an audit log entry.
     */
    public static function record(string $action, $target = null, array $meta = []): self
    {
        return self::create([
            'actor_user_id' => Auth::id(),
            'action' => $action,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->id,
            'meta' => $meta ?: null,
            'created_at' => now(),
        ]);
    }
}
