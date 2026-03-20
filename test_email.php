<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$ticket = \App\Models\Ticket::where('ticket_no', '!=', '0')->first();

if ($ticket) {
    if (!$ticket->creator) {
        $user = \App\Models\User::first();
        $ticket->user_id = $user->id;
        $ticket->save();
        $ticket->load('creator');
    }

    // Force enabled to test
    \App\Models\NotificationSetting::where('key', 'ticket_received')->update(['enabled' => true]);

    $notificationService = new \App\Services\NotificationService();
    echo 'Triggering notification for Ticket #' . $ticket->ticket_no . "\n";
    $result = $notificationService->sendNotification($ticket, 'ticket_received');
    
    if ($result) {
        echo 'Notification created and email job dispatched.' . "\n";
        echo 'Subject: ' . $result->subject . "\n";
        echo 'Recipient: ' . $result->recipient_email . "\n";
        echo "Check your mailhog or mailtrap inbox!\n";
    } else {
        echo 'Failed to create notification log.';
    }
} else {
    echo 'No tickets found in the database.';
}
