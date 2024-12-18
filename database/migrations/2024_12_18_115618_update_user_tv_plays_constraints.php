<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_tv_plays', function (Blueprint $table) {
            // Drop existing foreign keys
            $table->dropForeign(['show_id']);
            $table->dropForeign(['season_id']);
            $table->dropForeign(['episode_id']);

            // Drop existing columns
            $table->dropColumn(['show_id', 'season_id', 'episode_id']);
        });

        Schema::table('user_tv_plays', function (Blueprint $table) {
            // Add new foreign keys to user TV tables
            $table->foreignId('user_tv_show_id')->nullable()
                ->constrained('user_tv_shows')
                ->cascadeOnDelete();

            $table->foreignId('user_tv_season_id')->nullable()
                ->constrained('user_tv_seasons')
                ->cascadeOnDelete();

            $table->foreignId('user_tv_episode_id')->nullable()
                ->constrained('user_tv_episodes')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('user_tv_plays', function (Blueprint $table) {
            // Drop new foreign keys
            $table->dropForeign(['user_tv_show_id']);
            $table->dropForeign(['user_tv_season_id']);
            $table->dropForeign(['user_tv_episode_id']);

            // Drop new columns
            $table->dropColumn(['user_tv_show_id', 'user_tv_season_id', 'user_tv_episode_id']);
        });

        Schema::table('user_tv_plays', function (Blueprint $table) {
            // Restore original columns and foreign keys
            $table->foreignId('show_id')
                ->constrained('tv_shows')
                ->cascadeOnDelete();

            $table->foreignId('season_id')
                ->nullable()
                ->constrained('tv_seasons')
                ->cascadeOnDelete();

            $table->foreignId('episode_id')
                ->nullable()
                ->constrained('tv_episodes')
                ->cascadeOnDelete();
        });
    }
};
