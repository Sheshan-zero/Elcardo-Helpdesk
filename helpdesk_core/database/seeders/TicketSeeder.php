<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketStatusHistory;
use App\Models\User;
use App\Models\Branch;
use App\Models\Module;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        $regularUser = User::where('role', User::ROLE_USER)->first();
        $branches = Branch::all();
        $modules = Module::all();

        if (!$admin || !$regularUser || $branches->isEmpty() || $modules->isEmpty()) {
            $this->command->warn('Required data not found. Make sure users, branches, and modules are seeded first.');
            return;
        }

        // Sample tickets with variety of statuses
        $tickets = [
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Printer')->first()->id,
                'issue_description' => 'Office printer on 3rd floor is not responding. Print jobs are stuck in queue. Tried restarting but issue persists.',
                'priority' => 'HIGH',
                'status' => 'IN_PROGRESS',
                'assigned_admin_id' => $admin->id,
                'ip_address' => '192.168.1.45',
                'anydesk_code' => '123456789',
                'phone' => '0771234567',
                'created_at' => Carbon::now()->subDays(2),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Network')->first()->id,
                'issue_description' => 'Getting "Network path not found" error when trying to access \\\\fileserver\\documents. Need urgent access for presentation.',
                'priority' => 'URGENT',
                'status' => 'WAITING_USER',
                'assigned_admin_id' => $admin->id,
                'ip_address' => '192.168.1.78',
                'phone' => '0772345678',
                'created_at' => Carbon::now()->subHours(5),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'ERP Dynamic')->first()->id,
                'issue_description' => 'ERP Dynamic application keeps timing out during login. Shows "Server connection failed" message.',
                'priority' => 'MEDIUM',
                'status' => 'RESOLVED',
                'assigned_admin_id' => $admin->id,
                'resolved_at' => Carbon::now()->subHours(12),
                'phone' => '0773456789',
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Network')->first()->id,
                'issue_description' => 'Internet speed is very slow. Takes minutes to load simple websites. Affecting work productivity.',
                'priority' => 'LOW',
                'status' => 'NEW',
                'phone' => '0774567890',
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Printer')->first()->id,
                'issue_description' => 'Office printer shows paper jam error. Already checked all trays but cannot find jammed paper.',
                'priority' => 'MEDIUM',
                'status' => 'CLOSED',
                'assigned_admin_id' => $admin->id,
                'resolved_at' => Carbon::now()->subDays(3),
                'closed_at' => Carbon::now()->subDays(3),
                'phone' => '0775678901',
                'created_at' => Carbon::now()->subDays(4),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Other')->first()->id,
                'issue_description' => 'Need Adobe Acrobat Pro installed on my computer for client presentations. Current version is outdated.',
                'priority' => 'LOW',
                'status' => 'ASSIGNED',
                'assigned_admin_id' => $admin->id,
                'ip_address' => '192.168.1.120',
                'anydesk_code' => '987654321',
                'phone' => '0776789012',
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'ERP Dynamic')->first()->id,
                'issue_description' => 'Getting error when trying to generate monthly sales report in ERP. Error code: ERR_TIMEOUT_001.',
                'priority' => 'HIGH',
                'status' => 'IN_PROGRESS',
                'assigned_admin_id' => $admin->id,
                'phone' => '0777890123',
                'created_at' => Carbon::now()->subHours(8),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Network')->first()->id,
                'issue_description' => 'Company email not syncing on my iPhone. Already tried removing and re-adding account.',
                'priority' => 'MEDIUM',
                'status' => 'WAITING_VENDOR',
                'assigned_admin_id' => $admin->id,
                'phone' => '0778901234',
                'created_at' => Carbon::now()->subDays(1),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Other')->first()->id,
                'issue_description' => 'Forgot my Windows login password. Need urgent reset to access files for client meeting.',
                'priority' => 'URGENT',
                'status' => 'RESOLVED',
                'assigned_admin_id' => $admin->id,
                'resolved_at' => Carbon::now()->subHours(2),
                'phone' => '0779012345',
                'created_at' => Carbon::now()->subHours(4),
            ],
            [
                'created_by_user_id' => $regularUser->id,
                'branch_id' => $branches->random()->id,
                'module_id' => $modules->where('name', 'Printer')->first()->id,
                'issue_description' => 'Scanner function on multifunction printer not responding. Printing works fine but scan button does nothing.',
                'priority' => 'LOW',
                'status' => 'NEW',
                'phone' => '0770123456',
                'created_at' => Carbon::now()->subMinutes(30),
            ],
        ];

        foreach ($tickets as $ticketData) {
            // Generate ticket number if not provided (simple generation for seeding)
            if (!isset($ticketData['ticket_no'])) {
                $ticketData['ticket_no'] = 'ELC-' . strtoupper(Str::random(6));
            }
            
            $ticket = Ticket::create($ticketData);

            // Add initial history entry
            TicketStatusHistory::create([
                'ticket_id' => $ticket->id,
                'from_status' => null,
                'to_status' => 'NEW',
                'changed_by_user_id' => $ticket->created_by_user_id,
                'note' => 'Ticket created by user',
                'created_at' => $ticket->created_at,
            ]);

            // Add assignment history if assigned
            if ($ticket->assigned_admin_id) {
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'from_status' => 'NEW',
                    'to_status' => 'ASSIGNED',
                    'changed_by_user_id' => $ticket->assigned_admin_id,
                    'note' => 'Ticket assigned to ' . User::find($ticket->assigned_admin_id)->name,
                    'created_at' => $ticket->created_at->addMinutes(10),
                ]);
            }

            // Add status update history for non-new tickets
            if ($ticket->status !== 'NEW' && $ticket->status !== 'ASSIGNED') {
                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'from_status' => 'ASSIGNED',
                    'to_status' => $ticket->status,
                    'changed_by_user_id' => $ticket->assigned_admin_id ?? $admin->id,
                    'note' => 'Status changed to ' . $ticket->status,
                    'created_at' => $ticket->created_at->addMinutes(30),
                ]);
            }

            // Add resolution note for resolved/closed tickets
            if (in_array($ticket->status, ['RESOLVED', 'CLOSED'])) {
                $resolutionNotes = [
                    'Issue resolved. Restarted service and verified functionality.',
                    'Problem fixed. Updated configuration settings.',
                    'Resolved via remote access. User confirmed working.',
                    'Fixed network connectivity. Issue was with DNS cache.',
                    'Software reinstalled. Everything working now.',
                ];

                TicketStatusHistory::create([
                    'ticket_id' => $ticket->id,
                    'from_status' => 'IN_PROGRESS',
                    'to_status' => 'RESOLVED',
                    'changed_by_user_id' => $ticket->assigned_admin_id ?? $admin->id,
                    'note' => $resolutionNotes[array_rand($resolutionNotes)],
                    'created_at' => $ticket->resolved_at ?? $ticket->created_at->addHours(2),
                ]);
            }
        }

        $this->command->info('Successfully seeded ' . count($tickets) . ' tickets with history!');
    }
}
