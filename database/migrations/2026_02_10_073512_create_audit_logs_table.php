<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // e.g. ticket.status_changed, kb.published
            $table->string('target_type')->nullable(); // e.g. App\Models\Ticket
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('meta')->nullable(); // Additional context
            $table->timestamp('created_at');

            $table->index(['target_type', 'target_id']);
            $table->index('actor_user_id');
            $table->index('action');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
