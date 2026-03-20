<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_notifications_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->string('key');
            $table->string('recipient_email');
            $table->string('subject');
            $table->enum('status', ['QUEUED', 'SENT', 'FAILED'])->default('QUEUED');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            
            $table->index(['ticket_id', 'key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_notifications_log');
    }
};
