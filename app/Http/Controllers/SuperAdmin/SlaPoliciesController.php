<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Branch;
use App\Models\Module;
use App\Models\SlaPolicy;
use App\Services\SlaService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SlaPoliciesController extends Controller
{
    /**
     * Display SLA policies list.
     */
    public function index()
    {
        $policies = SlaPolicy::with(['branch:id,name', 'module:id,name'])
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->get();

        return Inertia::render('SuperAdmin/SlaPolicies', [
            'policies' => $policies,
            'branches' => Branch::active()->get(['id', 'name']),
            'modules' => Module::active()->get(['id', 'name']),
            'priorities' => ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        ]);
    }

    /**
     * Store a new SLA policy.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'applies_to_branch_id' => 'nullable|exists:branches,id',
            'applies_to_module_id' => 'nullable|exists:modules,id',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,URGENT',
            'first_response_minutes' => 'nullable|integer|min:1',
            'resolution_minutes' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // At least one SLA metric required
        if (empty($validated['first_response_minutes']) && empty($validated['resolution_minutes'])) {
            return back()->withErrors(['first_response_minutes' => 'At least one SLA metric (first response or resolution) is required.']);
        }

        $policy = SlaPolicy::create($validated);

        AuditLog::record('created', $policy);

        return back()->with('success', 'SLA Policy created successfully.');
    }

    /**
     * Update an existing SLA policy.
     */
    public function update(Request $request, SlaPolicy $slaPolicy)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'applies_to_branch_id' => 'nullable|exists:branches,id',
            'applies_to_module_id' => 'nullable|exists:modules,id',
            'priority' => 'nullable|in:LOW,MEDIUM,HIGH,URGENT',
            'first_response_minutes' => 'nullable|integer|min:1',
            'resolution_minutes' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        if (empty($validated['first_response_minutes']) && empty($validated['resolution_minutes'])) {
            return back()->withErrors(['first_response_minutes' => 'At least one SLA metric is required.']);
        }

        $slaPolicy->update($validated);

        AuditLog::record('updated', $slaPolicy, ['changes' => $slaPolicy->getChanges()]);

        return back()->with('success', 'SLA Policy updated successfully.');
    }

    /**
     * Delete an SLA policy.
     */
    public function destroy(SlaPolicy $slaPolicy)
    {
        $policyCopy = clone $slaPolicy;
        $slaPolicy->delete();

        AuditLog::record('deleted', $policyCopy);

        return back()->with('success', 'SLA Policy deleted successfully.');
    }

    /**
     * Backfill SLA due dates for existing tickets.
     */
    public function backfill(SlaService $slaService)
    {
        $count = $slaService->backfillDueDates();

        return back()->with('success', "{$count} tickets updated with SLA due dates.");
    }
}
