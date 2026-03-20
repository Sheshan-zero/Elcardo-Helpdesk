<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_type_id')->constrained('request_types')->cascadeOnDelete();
            $table->string('label');
            $table->string('field_type'); // text, textarea, select, checkbox, file
            $table->json('options')->nullable(); // For select options
            $table->boolean('is_required')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_fields');
    }
};
