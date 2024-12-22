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
            // Drop the existing unique constraint
            $table->dropUnique('anime_episode_unique_mapping');

            // Add the new unique constraint including anidb_episode_number
            $table->unique(
                ['anidb_id', 'tvdb_series_id', 'anidb_episode_number', 'is_special'],
                'anime_episode_unique_mapping'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anime_episode_mappings', function (Blueprint $table) {
            // Drop the new constraint
            $table->dropUnique('anime_episode_unique_mapping');

            // Restore the original constraint
            $table->unique(
                ['anidb_id', 'tvdb_series_id', 'is_special'],
                'anime_episode_unique_mapping'
            );
        });
    }
};
