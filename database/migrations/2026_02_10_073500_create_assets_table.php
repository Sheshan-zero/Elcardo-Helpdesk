<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('asset_tag')->unique();
            $table->string('type'); // PC, Printer, Router, etc.
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('assigned_to_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('hostname')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('anydesk_code')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
