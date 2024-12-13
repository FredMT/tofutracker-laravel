<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('anime_mapping_external_ids', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('anidb_id')->nullable();
            $table->unsignedInteger('mal_id')->nullable();
            $table->unsignedInteger('themoviedb_id')->nullable();
            $table->unsignedInteger('thetvdb_id')->nullable();
            $table->unsignedInteger('kitsu_id')->nullable();
            $table->unsignedInteger('anilist_id')->nullable();
            $table->unsignedInteger('anisearch_id')->nullable();
            $table->unsignedInteger('livechart_id')->nullable();

            // String-based IDs
            $table->string('notify_moe_id')->nullable();
            $table->string('anime_planet_id')->nullable();
            $table->string('imdb_id')->nullable();

            // Type field
            $table->string('type')->nullable();

            // Timestamps for record keeping
            $table->timestamps();

            // Indexes for frequently queried fields
            $table->unique('anidb_id');
            $table->index('mal_id');
            $table->index('themoviedb_id');
            $table->index('thetvdb_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anime_mapping_external_ids');
    }
};
