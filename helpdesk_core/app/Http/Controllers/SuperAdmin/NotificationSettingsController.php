<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\NotificationSetting;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingsController extends Controller
{
    public function index(): Response
    {
        $settings = NotificationSetting::all();

        return Inertia::render('SuperAdmin/NotificationSettings', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, string $key): RedirectResponse
    {
        $setting = NotificationSetting::where('key', $key)->firstOrFail();

        $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $setting->update([
            'enabled' => $request->enabled,
        ]);

        return back()->with('success', "Notification '{$setting->label}' updated.");
    }
}
