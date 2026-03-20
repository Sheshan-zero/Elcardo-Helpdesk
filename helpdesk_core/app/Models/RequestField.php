<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestField extends Model
{
    use HasFactory;

    protected $fillable = ['request_type_id', 'label', 'field_type', 'options', 'is_required', 'order'];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
    ];

    public function requestType()
    {
        return $this->belongsTo(RequestType::class);
    }
}
