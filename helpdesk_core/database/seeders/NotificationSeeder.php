<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\NotificationSetting;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            [
                'key' => 'ticket_received',
                'label' => 'Ticket Received',
                'description' => 'Sent when user submits a new ticket',
                'enabled' => true,
            ],
            [
                'key' => 'admin_ticket_received',
                'label' => 'Admin - New Ticket Received',
                'description' => 'Sent to Super Admins & Admins when a new ticket is created',
                'enabled' => true,
            ],
            [
                'key' => 'ticket_assigned',
                'label' => 'Ticket Assigned',
                'description' => 'Sent when ticket is assigned to an admin',
                'enabled' => true,
            ],
            [
                'key' => 'admin_ticket_assigned',
                'label' => 'Admin - Ticket Assigned To You',
                'description' => 'Sent to the specific Admin when a ticket is assigned to them',
                'enabled' => true,
            ],
            [
                'key' => 'ticket_in_progress',
                'label' => 'Ticket In Progress',
                'description' => 'Sent when admin starts working on ticket',
                'enabled' => true,
            ],
            [
                'key' => 'ticket_resolved',
                'label' => 'Ticket Resolved',
                'description' => 'Sent when ticket is marked as resolved (includes Fixed/Not Fixed links)',
                'enabled' => true,
            ],
            [
                'key' => 'ticket_closed',
                'label' => 'Ticket Closed',
                'description' => 'Sent when ticket is closed (optional)',
                'enabled' => false,
            ],
        ];

        foreach ($settings as $setting) {
            NotificationSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $htmlWrapper = function($title, $content) {
            return '<div style="background-color: #f4f7f6; padding: 40px 20px; font-family: \'Inter\', Helvetica, Arial, sans-serif; color: #333333;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                    <div style="background-color: #1e293b; padding: 30px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">' . $title . '</h1>
                    </div>
                    <div style="padding: 40px 30px; font-size: 16px; line-height: 1.6; color: #475569;">
                        ' . $content . '
                    </div>
                    <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 14px; color: #94a3b8;">
                        <p style="margin: 0;">&copy; ' . date('Y') . ' Elcardo Helpdesk System. All rights reserved.</p>
                    </div>
                </div>
            </div>';
        };

        $templates = [
            [
                'key' => 'ticket_received',
                'subject' => 'Ticket #{{ticket_no}} Received - {{branch}}',
                'is_html' => true,
                'body' => $htmlWrapper('Ticket Received', '
                    <p style="margin-top: 0;">Dear User,</p>
                    <p>Your support ticket has been successfully submitted and logged in our system. Our team will review your request shortly.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 40%; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Ticket Number</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">#{{ticket_no}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Branch</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{branch}}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Module</td><td style="padding: 8px 0; font-weight: 500;">{{module}}</td></tr>
                        </table>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Issue Summary</h4>
                        <p style="margin: 0; background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; color: #334155; border-radius: 0 8px 8px 0; font-style: italic;">"{{issue_summary}}"</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="{{ticket_url}}" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">View Ticket Status</a>
                    </div>
                '),
            ],
            [
                'key' => 'admin_ticket_received',
                'subject' => '[New Ticket] #{{ticket_no}} - {{branch}} / {{module}}',
                'is_html' => true,
                'body' => $htmlWrapper('New Support Ticket', '
                    <p style="margin-top: 0;">Hello Team,</p>
                    <p>A new support ticket has been submitted to the helpdesk system. Please review and assign as necessary.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 40%; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Ticket Number</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #0f172a;">#{{ticket_no}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Created By</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{creator_name}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Branch</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{branch}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Module</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{module}}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Priority</td><td style="padding: 8px 0;"><span style="background-color: #fee2e2; color: #ef4444; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase;">{{priority}}</span></td></tr>
                        </table>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Issue Summary</h4>
                        <p style="margin: 0; background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; color: #334155; border-radius: 0 8px 8px 0; font-style: italic;">"{{issue_summary}}"</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="{{ticket_view_url}}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">View & Assign Ticket</a>
                    </div>
                '),
            ],
            [
                'key' => 'ticket_assigned',
                'subject' => 'Ticket #{{ticket_no}} Assigned',
                'is_html' => true,
                'body' => $htmlWrapper('Ticket Assigned', '
                    <p style="margin-top: 0;">Dear User,</p>
                    <p>Your ticket has been assigned to a support specialist who will begin working on your issue as soon as possible.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                        <p style="color: #64748b; font-size: 14px; text-transform: uppercase; font-weight: 600; margin: 0 0 5px 0;">Assigned To</p>
                        <p style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0;">{{assigned_admin_name}}</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="{{ticket_url}}" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">Track Progress</a>
                    </div>
                '),
            ],
            [
                'key' => 'admin_ticket_assigned',
                'subject' => '[Ticket Assigned] #{{ticket_no}} has been assigned to you',
                'is_html' => true,
                'body' => $htmlWrapper('Ticket Assigned To You', '
                    <p style="margin-top: 0;">Hello {{assigned_admin_name}},</p>
                    <p>Ticket <strong>#{{ticket_no}}</strong> has been assigned to your queue.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; width: 40%; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Created By</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{creator_name}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Branch</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{branch}}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Module</td><td style="padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-weight: 500;">{{module}}</td></tr>
                            <tr><td style="padding: 8px 0; color: #64748b; font-weight: 600; font-size: 14px; text-transform: uppercase;">Priority</td><td style="padding: 8px 0;"><span style="background-color: #fee2e2; color: #ef4444; padding: 4px 10px; border-radius: 9999px; font-weight: 700; font-size: 12px; text-transform: uppercase;">{{priority}}</span></td></tr>
                        </table>
                    </div>
                    
                    <div style="margin: 25px 0;">
                        <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Issue Summary</h4>
                        <p style="margin: 0; background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; color: #334155; border-radius: 0 8px 8px 0; font-style: italic;">"{{issue_summary}}"</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="{{ticket_view_url}}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">Open Work Console</a>
                    </div>
                '),
            ],
            [
                'key' => 'ticket_in_progress',
                'subject' => 'Ticket #{{ticket_no}} In Progress',
                'is_html' => true,
                'body' => $htmlWrapper('Work Commenced', '
                    <p style="margin-top: 0;">Dear User,</p>
                    <p>Good news! We have actively started working on resolving your ticket <strong>#{{ticket_no}}</strong>.</p>
                    
                    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                        <p style="color: #1e40af; font-weight: 600; margin: 0;">We will notify you immediately once the issue has been successfully resolved.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="{{ticket_url}}" style="background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);">Track Progress</a>
                    </div>
                '),
            ],
            [
                'key' => 'ticket_resolved',
                'subject' => 'Action Required: Ticket #{{ticket_no}} Resolved',
                'is_html' => true,
                'body' => $htmlWrapper('Issue Resolved', '
                    <p style="margin-top: 0;">Dear User,</p>
                    <p>Our team has marked your ticket <strong>#{{ticket_no}}</strong> as <strong>Resolved</strong>.</p>
                    
                    <div style="background-color: #f1f5f9; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center; border-left: 4px solid #10b981;">
                        <h3 style="margin: 0 0 15px 0; color: #0f172a; font-size: 18px;">Please Confirm Resolution</h3>
                        <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px;">Is your issue completely fixed and working as expected?</p>
                        
                        <div style="display: flex; gap: 15px; justify-content: center;">
                            <a href="{{fixed_url}}" style="background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);">Yes, It\'s Fixed</a>
                            <a href="{{not_fixed_url}}" style="background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);">No, Still Broken</a>
                        </div>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b; text-align: center; font-style: italic;">Note: If we do not receive a response within 7 days, the ticket will be automatically closed.</p>
                '),
            ],
            [
                'key' => 'ticket_closed',
                'subject' => 'Ticket #{{ticket_no}} Closed',
                'is_html' => true,
                'body' => $htmlWrapper('Ticket Closed', '
                    <p style="margin-top: 0;">Dear User,</p>
                    <p>Your ticket <strong>#{{ticket_no}}</strong> has been permanently closed.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                        <p style="color: #475569; margin: 0;">If you continue to experience issues or need further assistance, please open a fresh support ticket.</p>
                    </div>
                    
                    <p style="text-align: center; font-weight: 600; color: #0f172a; margin-top: 30px;">Thank you for using the Elcardo Helpdesk.</p>
                '),
            ],
        ];

        foreach ($templates as $template) {
            EmailTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
