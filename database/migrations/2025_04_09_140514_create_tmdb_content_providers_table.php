<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tmdb_content_providers', function (Blueprint $table) {
            $table->id();
            $table->morphs('content'); // Creates content_id and content_type columns
            $table->unsignedInteger('provider_id');
            $table->string('provider_type'); // 'ads', 'buy', 'rent', 'flatrate', 'free'
            $table->string('country_code', 2); // Two-letter country code

            // Create indexes for better query performance
            $table->index('provider_id');
            $table->index('country_code');
            $table->index('provider_type');

            // Create unique constraint to prevent duplicates
            $table->unique(['content_type', 'content_id', 'provider_id', 'provider_type', 'country_code']);

            // Set up foreign key to tmdb_providers table
            $table->foreign('provider_id')
                ->references('id')
                ->on('tmdb_providers')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_content_providers');
    }
};
