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
        Schema::create('tmdb_schedules', function (Blueprint $table) {
            $table->id();

            $table->string('tmdb_id');
            $table->string('tmdb_type');

            // For TV shows, this will store the TvEpisode ID
            // For movies, this will be null as the movie directly refers to itself
            $table->unsignedBigInteger('episode_id')->nullable();
            $table->unsignedBigInteger('vote_count')->nullable();

            $table->timestamp('air_date')->nullable();

            $table->index(['tmdb_id', 'tmdb_type']);
            $table->index('episode_id');
            $table->index('air_date');

            $table->foreign('episode_id')
                  ->references('id')
                  ->on('tv_episodes')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_schedules');
    }
};
