<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\WallboardSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;

class WallboardSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = WallboardSetting::getAllSettings();
        $defaults = WallboardSetting::getDefaults();
        $settings = array_merge($defaults, $settings);

        return Inertia::render('SuperAdmin/WallboardSettings', [
            'settings' => $settings,
            'branches' => Branch::active()->get(['id', 'name']),
            'allStatuses' => [
                'NEW', 'ASSIGNED', 'IN_PROGRESS', 
                'WAITING_USER', 'WAITING_VENDOR', 
                'RESOLVED', 'CLOSED'
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'refresh_interval' => 'required|integer|in:10,20,30,60',
            'visible_columns' => 'required|array|min:1',
            'visible_columns.*' => 'string',
            'show_admin_name' => 'required|boolean',
            'user_display' => 'required|in:none,initials,full',
            'show_remote_badges' => 'required|boolean',
            'warn_hours' => 'required|integer|min:1|max:168',
            'critical_hours' => 'required|integer|min:1|max:336',
            'branch_filter' => 'nullable|integer|exists:branches,id',
            'signed_link_days' => 'required|integer|min:1|max:365',
        ]);

        foreach ($validated as $key => $value) {
            WallboardSetting::setValue($key, $value);
        }

        AuditLog::record('updated', new WallboardSetting(), ['settings' => $validated]);

        return back()->with('success', 'Wallboard settings updated.');
    }

    public function generateSignedLink(): JsonResponse
    {
        $days = WallboardSetting::getValue('signed_link_days', 30);

        $url = URL::temporarySignedRoute(
            'wallboard',
            now()->addDays($days)
        );

        return response()->json([
            'url' => $url,
            'expires_at' => now()->addDays($days)->toIso8601String(),
        ]);
    }
}
