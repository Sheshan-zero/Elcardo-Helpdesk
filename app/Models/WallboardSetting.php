<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WallboardSetting extends Model
{
    use HasFactory;

    protected $fillable = ['key', 'value'];

    protected $casts = [
        'value' => 'json',
    ];

    /**
     * Get a setting value by key with optional default.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set a setting value.
     */
    public static function setValue(string $key, mixed $value): void
    {
        self::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    /**
     * Get all settings as an associative array.
     */
    public static function getAllSettings(): array
    {
        return self::all()->pluck('value', 'key')->toArray();
    }

    /**
     * Get default settings.
     */
    public static function getDefaults(): array
    {
        return [
            'refresh_interval' => 30,
            'visible_columns' => ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_USER', 'WAITING_VENDOR', 'RESOLVED'],
            'show_admin_name' => true,
            'user_display' => 'initials', // 'none', 'initials', 'full'
            'show_remote_badges' => true,
            'warn_hours' => 24,
            'critical_hours' => 72,
            'branch_filter' => null, // null = all branches
            'signed_link_days' => 30,
        ];
    }
}
