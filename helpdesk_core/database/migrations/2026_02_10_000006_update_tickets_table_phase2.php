<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->foreignId('assigned_admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('priority')->nullable(); // LOW, MEDIUM, HIGH, URGENT
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropForeign(['assigned_admin_id']);
            $table->dropColumn(['assigned_admin_id', 'priority', 'resolved_at', 'closed_at']);
        });
    }
};
