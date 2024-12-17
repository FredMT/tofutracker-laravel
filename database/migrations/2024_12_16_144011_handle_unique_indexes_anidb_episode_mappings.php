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
        Schema::table('anime_episode_mappings', function (Blueprint $table) {
            // Drop existing non-unique composite index
            $table->dropIndex('anime_episode_mappings_id_anidb_id_tvdb_series_id_is_special_in');

            // Add new unique composite index for the three columns needed for upsert
            $table->unique(['anidb_id', 'tvdb_series_id', 'is_special'], 'anime_episode_unique_mapping');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anime_episode_mappings', function (Blueprint $table) {
            // Restore original index
            $table->index(
                ['id', 'anidb_id', 'tvdb_series_id', 'is_special'],
                'anime_episode_mappings_id_anidb_id_tvdb_series_id_is_special_in'
            );

            // Remove unique index
            $table->dropUnique('anime_episode_unique_mapping');
        });
    }
};
