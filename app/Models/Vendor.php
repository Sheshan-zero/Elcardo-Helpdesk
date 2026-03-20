<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'contact_email', 'contact_phone', 'notes'];

    public function tickets()
    {
        return $this->belongsToMany(Ticket::class, 'ticket_vendors')
            ->withPivot('status', 'reference_no')
            ->withTimestamps();
    }
}
