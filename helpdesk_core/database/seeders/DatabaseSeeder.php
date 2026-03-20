<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin
        User::create([
            'name' => 'ITADMIN',
            'email' => 'itofficer.elcardo@gmail.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_SUPER_ADMIN,
        ]);

        // Create Admins
        $admins = [
            ['name' => 'Sasitha', 'email' => 'admin@elcardo.lk'],
            ['name' => 'Sheshan', 'email' => 'sheshan.it@elcardo.com'],
            ['name' => 'Shyan', 'email' => 'shyan.it@elcardo.com'],
        ];

        foreach ($admins as $admin) {
            User::create([
                'name' => $admin['name'],
                'email' => $admin['email'],
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN,
            ]);
        }

        // Create Test User
        User::create([
            'name' => 'Test User',
            'email' => 'user@elcardo.com',
            'password' => bcrypt('password'),
            'role' => User::ROLE_USER,
        ]);

        // Create Branches
        $branches = [
            'Kandy Factory',
            'Bandarawela',
            'Anuradhapura',
            'Matara',
            'Jaffna',
            'Ratmalana',
            'Ratmalana Factory',
            'Kurunagala',
            'Batticaloa',
            'Rathnapura',
            'Kandy',
            'Negombo',
            'ELME Battery',
            'Anilad Kandy',
            'Anilad Bandarawela',
        ];

        foreach ($branches as $branchName) {
            // Generate a simple code from the first letters (e.g. "Kandy Factory" -> "KF")
            $code = collect(explode(' ', $branchName))->map(fn($word) => strtoupper(substr($word, 0, 1)))->join('');
            
            Branch::create([
                'name' => $branchName,
                'code' => $code . substr(md5($branchName), 0, 2), // Ensure uniqueness
                'is_head_office' => false,
                'is_active' => true,
            ]);
        }

        // Create Modules
        $modules = [
            ['name' => 'Printer', 'description' => 'Printer related issues'],
            ['name' => 'Network', 'description' => 'Network connectivity issues'],
            ['name' => 'ERP Dynamic', 'description' => 'ERP system issues'],
            ['name' => 'Other', 'description' => 'Other IT issues'],
        ];

        foreach ($modules as $module) {
            Module::create($module);
        }

        // Seed notification settings and templates
        $this->call(NotificationSeeder::class);
        
        // Seed knowledge base articles
        $this->call(KnowledgeBaseSeeder::class);
        
        // Seed sample tickets
        $this->call(TicketSeeder::class);
    }
}
