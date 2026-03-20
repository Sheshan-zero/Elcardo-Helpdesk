<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Module;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    public function index(): Response
    {
        $modules = Module::orderBy('name')->get();

        return Inertia::render('SuperAdmin/Modules/Index', [
            'modules' => $modules,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:modules,name'],
            'description' => ['nullable', 'string'],
        ]);

        $module = Module::create($validated);

        AuditLog::record('created', $module);

        return redirect()->route('superadmin.modules.index')
            ->with('success', 'Module created successfully.');
    }

    public function update(Request $request, Module $module): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:modules,name,' . $module->id],
            'description' => ['nullable', 'string'],
        ]);

        $module->update($validated);

        AuditLog::record('updated', $module, ['changes' => $module->getChanges()]);

        return redirect()->route('superadmin.modules.index')
            ->with('success', 'Module updated successfully.');
    }

    public function toggle(Module $module): RedirectResponse
    {
        $module->update(['is_active' => !$module->is_active]);

        AuditLog::record($module->is_active ? 'activated' : 'deactivated', $module);

        return redirect()->route('superadmin.modules.index')
            ->with('success', 'Module status updated.');
    }
}
