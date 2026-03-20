<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->timestamp('first_admin_action_at')->nullable()->after('closed_at');
            $table->timestamp('first_response_due_at')->nullable()->after('first_admin_action_at');
            $table->timestamp('resolution_due_at')->nullable()->after('first_response_due_at');
            $table->timestamp('first_response_breached_at')->nullable()->after('resolution_due_at');
            $table->timestamp('resolution_breached_at')->nullable()->after('first_response_breached_at');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'first_admin_action_at',
                'first_response_due_at',
                'resolution_due_at',
                'first_response_breached_at',
                'resolution_breached_at',
            ]);
        });
    }
};
