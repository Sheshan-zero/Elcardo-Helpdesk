<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'label',
        'description',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    public static function isEnabled(string $key): bool
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->enabled : false;
    }
}
