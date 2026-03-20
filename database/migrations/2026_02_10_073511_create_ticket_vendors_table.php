<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->cascadeOnDelete();
            $table->foreignId('vendor_id')->constrained('vendors')->cascadeOnDelete();
            $table->string('status')->default('OPEN'); // OPEN, WAITING, RESOLVED
            $table->string('reference_no')->nullable();
            $table->timestamps();

            $table->index(['ticket_id', 'vendor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_vendors');
    }
};
