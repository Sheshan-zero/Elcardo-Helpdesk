<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reminders_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->string('reminder_type'); // ADMIN_OVERDUE, USER_WAITING, etc.
            $table->string('channel')->default('EMAIL');
            $table->string('recipient');
            $table->string('status'); // SENT, FAILED
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['ticket_id', 'reminder_type', 'sent_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reminders_log');
    }
};
