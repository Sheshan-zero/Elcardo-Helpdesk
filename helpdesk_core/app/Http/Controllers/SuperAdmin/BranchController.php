<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Branch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    public function index(): Response
    {
        $branches = Branch::orderBy('name')->get();

        return Inertia::render('SuperAdmin/Branches/Index', [
            'branches' => $branches,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:branches,name'],
            'code' => ['nullable', 'string', 'max:10'],
            'is_head_office' => ['boolean'],
        ]);

        // If setting as head office, unset any existing head office
        if (!empty($validated['is_head_office'])) {
            Branch::where('is_head_office', true)->update(['is_head_office' => false]);
        }

        $branch = Branch::create($validated);

        AuditLog::record('created', $branch);

        return redirect()->route('superadmin.branches.index')
            ->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, Branch $branch): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:branches,name,' . $branch->id],
            'code' => ['nullable', 'string', 'max:10'],
            'is_head_office' => ['boolean'],
        ]);

        // If setting as head office, unset any existing head office
        if (!empty($validated['is_head_office']) && !$branch->is_head_office) {
            Branch::where('is_head_office', true)->update(['is_head_office' => false]);
        }

        $branch->update($validated);

        AuditLog::record('updated', $branch, ['changes' => $branch->getChanges()]);

        return redirect()->route('superadmin.branches.index')
            ->with('success', 'Branch updated successfully.');
    }

    public function toggle(Branch $branch): RedirectResponse
    {
        $branch->update(['is_active' => !$branch->is_active]);

        AuditLog::record($branch->is_active ? 'activated' : 'deactivated', $branch);

        return redirect()->route('superadmin.branches.index')
            ->with('success', 'Branch status updated.');
    }
}
