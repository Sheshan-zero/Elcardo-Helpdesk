<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmailTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = EmailTemplate::all();

        // Sample variables for preview
        $sampleVariables = [
            'ticket_no' => 'ELC-000001',
            'branch' => 'Head Office',
            'module' => 'Printer',
            'status' => 'RESOLVED',
            'issue_summary' => 'Printer not working...',
            'ticket_url' => url('/my/tickets/1'),
            'assigned_admin_name' => 'Admin User',
            'fixed_url' => url('/tickets/1/confirm-fixed?sample=true'),
            'not_fixed_url' => url('/tickets/1/not-fixed?sample=true'),
        ];

        return Inertia::render('SuperAdmin/EmailTemplates', [
            'templates' => $templates,
            'sampleVariables' => $sampleVariables,
        ]);
    }

    public function update(Request $request, string $key): RedirectResponse
    {
        $template = EmailTemplate::where('key', $key)->firstOrFail();

        $request->validate([
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $template->update([
            'subject' => $request->subject,
            'body' => $request->body,
        ]);

        return back()->with('success', "Template '{$key}' updated.");
    }
}
