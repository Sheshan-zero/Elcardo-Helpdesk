<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_tag', 'type', 'branch_id', 'assigned_to_user_id',
        'hostname', 'ip_address', 'anydesk_code',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'asset_ticket');
    }
}
