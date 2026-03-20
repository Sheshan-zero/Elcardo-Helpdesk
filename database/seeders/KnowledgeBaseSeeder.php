<?php

namespace Database\Seeders;

use App\Models\KnowledgeArticle;
use App\Models\Module;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class KnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        // Get Admin user or create one if missing (fallback)
        $admin = User::where('role', User::ROLE_ADMIN)->first();
        if (!$admin) {
            $this->command->warn('Admin user not found. Creating a fallback admin user for seeding.');
            $admin = User::create([
                'name' => 'System Admin',
                'email' => 'system.admin@elcardo.com',
                'password' => bcrypt('password'),
                'role' => User::ROLE_ADMIN,
            ]);
        }

        $modules = Module::all();
        if ($modules->isEmpty()) {
            $this->command->warn('Modules not found. Skipping Knowledge Base seeding.');
            return;
        }

        $articles = [
            [
                'title' => 'How to Connect to Office Printer',
                'summary' => 'Step-by-step guide to connecting Windows 10/11 devices to the office network printer.',
                'body' => "# Connecting to Office Printer\n\n## Windows 10/11 Instructions\n\n1. Click on **Start** menu and select **Settings**\n2. Navigate to **Devices** → **Printers & Scanners**\n3. Click **Add a printer or scanner**\n4. Select your office printer from the list\n5. Follow the on-screen installation wizard\n\n## Network Printer Setup\n\nIf the printer doesn't appear:\n- Make sure you're connected to the office WiFi/Network\n- Add printer manually using IP address: `192.168.1.100`\n- Install printer drivers from: `\\\\fileserver\\drivers\\printers`\n\n## Common Issues\n\n**Problem**: Printer not found\n**Solution**: Restart the Print Spooler service\n\n**Problem**: Print jobs stuck in queue\n**Solution**: Clear the print queue and restart\n\nFor further assistance, submit a ticket to IT Department.",
                'module_name' => 'Printer',
                'is_published' => true,
            ],
            [
                'title' => 'Fixing Network Connectivity Issues',
                'summary' => 'Troubleshooting steps for common network and WiFi connection problems.',
                'body' => "# Network Connectivity Troubleshooting\n\n## Quick Diagnostics\n\n### Step 1: Check Physical Connection\n- Ensure ethernet cable is properly connected\n- Check WiFi is enabled on your device\n- Look for the network icon in system tray\n\n### Step 2: Restart Network Adapter\n```\n1. Open Control Panel\n2. Network and Sharing Center\n3. Change Adapter Settings\n4. Right-click your adapter → Disable\n5. Wait 10 seconds → Enable again\n```\n\n### Step 3: Flush DNS Cache\nOpen Command Prompt as Administrator and run:\n```\nipconfig /flushdns\nipconfig /release\nipconfig /renew\n```\n\n### Step 4: Check IP Configuration\n```\nipconfig /all\n```\nEnsure you have valid IP address (192.168.x.x)\n\n## WiFi Connection Guide\n\n**Office WiFi Networks:**\n- **Elcardo-Staff**: Main employee network\n- **Elcardo-Guest**: For visitors only\n\n**Password**: Contact IT Department\n\n## Still Having Issues?\n\nIf none of the above works, submit a ticket with:\n- Your computer name\n- Office location/branch\n- Error messages (screenshot if possible)",
                'module_name' => 'Network',
                'is_published' => true,
            ],
            [
                'title' => 'ERP Dynamic Login Issues',
                'summary' => 'Solutions for common ERP Dynamic login errors including invalid credentials and server timeouts.',
                'body' => "# ERP Dynamic Access Guide\n\n## Standard Login Procedure\n\n1. Open ERP Dynamic application\n2. Enter your employee ID (format: EMP####)\n3. Use your network password\n4. Select your branch from dropdown\n\n## Common Login Problems\n\n### \"Invalid Credentials\" Error\n- **Cause**: Incorrect password or locked account\n- **Solution**: Reset password via Self-Service Portal or contact IT\n\n### \"License Limit Reached\" Error\n- **Cause**: Maximum concurrent users exceeded\n- **Solution**: Wait for other users to log out, or request license expansion\n\n### \"Server Connection Failed\" Error\n- **Cause**: ERP server maintenance or network issue\n- **Solution**: Check network connection, verify server status on dashboard\n\n## Password Requirements\n\n- Minimum 8 characters\n- At least 1 uppercase letter\n- At least 1 number\n- At least 1 special character\n- Cannot reuse last 5 passwords\n\n## Module Access\n\nDifferent roles have different module permissions:\n- **Finance**: Full access to accounting modules\n- **HR**: Employee management modules\n- **Operations**: Inventory & logistics\n- **Management**: All modules + reporting\n\nFor access issues, submit ticket with required module details.",
                'module_name' => 'ERP Dynamic',
                'is_published' => true,
            ],
            [
                'title' => 'VPN Setup for Remote Work',
                'summary' => 'Instructions for installing and connecting to the company VPN from Windows and macOS devices.',
                'body' => "# VPN Configuration Guide\n\n## Prerequisites\n\n- Approved remote work authorization\n- Company-issued laptop or approved personal device\n- Active employee account\n- VPN credentials (request from IT if not received)\n\n## Installation Steps\n\n### Windows\n1. Download **Elcardo VPN Client** from: `\\\\fileserver\\software\\vpn\\`\n2. Run installer as Administrator\n3. Enter provided credentials:\n   - Server: `vpn.elcardo.com`\n   - Username: Your employee email\n   - Password: Provided VPN password (different from network password)\n\n### macOS\n1. Open **System Preferences** → **Network**\n2. Click **+** to add new connection\n3. Select **VPN** (IKEv2)\n4. Configure with IT-provided settings\n\n## Connecting to VPN\n\n1. Launch VPN client\n2. Click **Connect**\n3. Wait for \"Connected\" status (green icon)\n4. Access office resources normally\n\n## Troubleshooting\n\n**Can't Connect**:\n- Check internet connection\n- Verify credentials\n- Ensure firewall allows VPN traffic\n\n**Slow Connection**:\n- Close unnecessary applications\n- Check home internet speed\n- Use ethernet instead of WiFi\n\n**Access Denied to Resources**:\n- Confirm VPN is connected\n- Check with IT for permissions\n\nFor VPN credential issues, email: it@elcardo.com",
                'module_name' => 'Network',
                'is_published' => true,
            ],
            [
                'title' => 'Email Configuration on Mobile Devices',
                'summary' => 'Guide to setting up corporate email on iOS and Android devices using Microsoft Exchange.',
                'body' => "# Mobile Email Setup\n\n## iOS (iPhone/iPad)\n\n1. Open **Settings**\n2. Scroll to **Mail** → **Accounts**\n3. Tap **Add Account** → **Microsoft Exchange**\n4. Enter your details:\n   - Email: yourname@elcardo.com\n   - Password: Your email password\n5. Server will auto-configure\n\n## Android\n\n1. Open **Gmail** app or **Email** app\n2. Menu → **Add Account**\n3. Select **Exchange and Office 365**\n4. Enter credentials:\n   - Server: outlook.office365.com\n   - Domain\\Username: ELCARDO\\yourname\n   - Password: Your email password\n\n## Settings Recommendation\n\n- **Sync**: Last 7 days (to save space)\n- **Notifications**: Enable for VIP contacts only\n- **Signature**: Include your name, title, and contact\n\n## Security\n\n- Enable device PIN/password\n- Don't save password on personal devices\n- Report lost devices immediately to IT\n\n## Common Issues\n\n**Email not syncing**:\n- Check internet connection\n- Verify password is correct\n- Re-add account\n\n**Can't send attachments**:\n- Maximum attachment size: 25MB\n- Use OneDrive for large files\n\nFor mobile email support, submit ticket with device details.",
                'module_name' => 'Other',
                'is_published' => true,
            ],
            [
                'title' => 'Password Reset Self-Service',
                'summary' => 'Instructions for using the self-service portal to reset forgotten or expired passwords.',
                'body' => "# How to Reset Your Password\n\n## Self-Service Portal\n\nVisit: **https://password.elcardo.com**\n\n### Reset Process:\n1. Enter your employee email\n2. Select verification method:\n   - SMS to registered mobile\n   - Email to recovery address\n   - Security questions\n3. Enter verification code\n4. Create new password\n5. Confirm password change\n\n## Password Policy\n\nYour new password must:\n- Be at least 8 characters long\n- Contain uppercase and lowercase letters\n- Include at least one number\n- Include at least one special character (!@#$%^&*)\n- Not match last 5 passwords\n- Not contain your name or username\n\n## Password Expiry\n\nPasswords expire every **90 days**. You'll receive reminder emails:\n- 14 days before expiry\n- 7 days before expiry\n- Daily for last 3 days\n\n## Locked Account\n\nAfter 5 failed login attempts, your account will be locked for 30 minutes.\n\n**To unlock immediately**:\n- Use Self-Service Portal\n- Or call IT Helpdesk ext: 200\n\n## Best Practices\n\n- Never share your password\n- Use different passwords for different systems\n- Consider using a password manager\n- Enable MFA (Multi-Factor Authentication) when available\n\n**Need Help?**\nContact IT Helpdesk or submit a ticket.",
                'module_name' => 'Other',
                'is_published' => true,
            ],
        ];

        foreach ($articles as $data) {
            try {
                $moduleName = $data['module_name'];
                unset($data['module_name']);
                
                $module = $modules->where('name', $moduleName)->first();
                if (!$module) {
                    $module = $modules->first();
                }
                
                $data['module_id'] = $module->id;
                $data['created_by_user_id'] = $admin->id;
                $data['slug'] = Str::slug($data['title']);

                KnowledgeArticle::create($data);
                $this->command->info("Created Article: {$data['title']}");
            } catch (\Exception $e) {
                $this->command->error("Failed to create article '{$data['title']}': " . $e->getMessage());
                Log::error("Seeder Error for article '{$data['title']}': " . $e->getMessage());
            }
        }
    }
}
