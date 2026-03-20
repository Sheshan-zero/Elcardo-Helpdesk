<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReplyTemplate extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'body', 'module_id', 'created_by_user_id'];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }
}
