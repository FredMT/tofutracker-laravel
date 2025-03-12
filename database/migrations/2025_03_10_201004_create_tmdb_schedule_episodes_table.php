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
        Schema::create('tmdb_schedule_episodes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('show_id')->comment('TMDB TV Show ID');
            $table->unsignedInteger('season_number');
            $table->unsignedInteger('episode_number');
            $table->unsignedBigInteger('episode_id')->comment('TMDB Episode ID');
            $table->timestamp('episode_date')->comment('Air timestamp of the episode');
            $table->string('episode_name')->nullable();

            // Indexes for faster lookups
            $table->index('show_id');
            $table->index('episode_id');
            $table->index('episode_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_schedule_episodes');
    }
};
