<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppLog extends Model
{
    protected $fillable = [
        'level',
        'message',
        'context',
    ];

    protected $casts = [
        'context' => 'array',
    ];

    const UPDATED_AT = null;
}
