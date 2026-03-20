<?php

namespace Database\Seeders;

use App\Models\SlaPolicy;
use Illuminate\Database\Seeder;

class SlaSeeder extends Seeder
{
    public function run(): void
    {
        // Default SLA (all tickets) - 2 hour first response, 48 hour resolution
        SlaPolicy::firstOrCreate(
            ['name' => 'Default SLA'],
            [
                'applies_to_branch_id' => null,
                'applies_to_module_id' => null,
                'priority' => null,
                'first_response_minutes' => 120,  // 2 hours
                'resolution_minutes' => 2880,      // 48 hours
                'is_active' => true,
            ]
        );

        // Urgent priority - 30 min response, 4 hour resolution
        SlaPolicy::firstOrCreate(
            ['name' => 'Urgent Priority SLA'],
            [
                'applies_to_branch_id' => null,
                'applies_to_module_id' => null,
                'priority' => 'URGENT',
                'first_response_minutes' => 30,
                'resolution_minutes' => 240,  // 4 hours
                'is_active' => true,
            ]
        );

        // High priority - 1 hour response, 24 hour resolution
        SlaPolicy::firstOrCreate(
            ['name' => 'High Priority SLA'],
            [
                'applies_to_branch_id' => null,
                'applies_to_module_id' => null,
                'priority' => 'HIGH',
                'first_response_minutes' => 60,
                'resolution_minutes' => 1440,  // 24 hours
                'is_active' => true,
            ]
        );
    }
}
