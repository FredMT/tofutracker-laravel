<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anime_chain_entries', function (Blueprint $table) {
            $table->index(['chain_id', 'anime_id']);
        });

        Schema::table('anime_maps', function (Blueprint $table) {
            $table->index('id');
        });

        Schema::table('anime_related_entries', function (Blueprint $table) {
            $table->index(['map_id', 'anime_id']);
        });

        Schema::table('anime_prequel_sequel_chains', function (Blueprint $table) {
            $table->index(['id', 'map_id']);
        });

        Schema::table('anidb_related_anime', function (Blueprint $table) {
            $table->index(['id', 'anime_id', 'related_anime_id']);
        });

        Schema::table('anidb_similar_anime', function (Blueprint $table) {
            $table->index(['id', 'anime_id', 'similar_anime_id']);
        });

        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->index('id');
        });

        Schema::table('anidb_creators', function (Blueprint $table) {
            $table->index('anime_id');
        });

        Schema::table('anidb_external_links', function (Blueprint $table) {
            $table->index('anime_id');
        });

        Schema::table('anidb_episodes', function (Blueprint $table) {
            $table->index('anime_id');
        });

        Schema::table('anidb_characters', function (Blueprint $table) {
            $table->index(['id', 'anime_id', 'character_id']);
        });

        Schema::table('anidb_seiyuus', function (Blueprint $table) {
            $table->index(['id', 'seiyuu_id']);
        });

        Schema::table('anidb_character_seiyuu', function (Blueprint $table) {
            $table->index(['id', 'character_id', 'seiyuu_id']);
        });

        Schema::table('tvdb_anime_seasons', function (Blueprint $table) {
            $table->index('id');
        });

        Schema::table('tvdb_anime_episodes', function (Blueprint $table) {
            $table->index(['id', 'series_id']);
        });

        Schema::table('anime_episode_mappings', function (Blueprint $table) {
            $table->index(['id', 'anidb_id', 'tvdb_series_id', 'is_special']);
        });
    }

    public function down(): void
    {
        Schema::table('anime_chain_entries', function (Blueprint $table) {
            $table->dropIndex(['chain_id', 'anime_id']);
        });

        Schema::table('anime_maps', function (Blueprint $table) {
            $table->dropIndex(['id']);
        });

        Schema::table('anime_related_entries', function (Blueprint $table) {
            $table->dropIndex(['map_id', 'anime_id']);
        });

        Schema::table('anime_prequel_sequel_chains', function (Blueprint $table) {
            $table->dropIndex(['id', 'map_id']);
        });

        Schema::table('anidb_related_anime', function (Blueprint $table) {
            $table->dropIndex(['id', 'anime_id', 'related_anime_id']);
        });

        Schema::table('anidb_similar_anime', function (Blueprint $table) {
            $table->dropIndex(['id', 'anime_id', 'similar_anime_id']);
        });

        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->dropIndex(['id']);
        });

        Schema::table('anidb_creators', function (Blueprint $table) {
            $table->dropIndex(['anime_id']);
        });

        Schema::table('anidb_external_links', function (Blueprint $table) {
            $table->dropIndex(['anime_id']);
        });

        Schema::table('anidb_episodes', function (Blueprint $table) {
            $table->dropIndex(['anime_id']);
        });

        Schema::table('anidb_characters', function (Blueprint $table) {
            $table->dropIndex(['id', 'anime_id', 'character_id']);
        });

        Schema::table('anidb_seiyuus', function (Blueprint $table) {
            $table->dropIndex(['id', 'seiyuu_id']);
        });

        Schema::table('anidb_character_seiyuu', function (Blueprint $table) {
            $table->dropIndex(['id', 'character_id', 'seiyuu_id']);
        });

        Schema::table('tvdb_anime_seasons', function (Blueprint $table) {
            $table->dropIndex(['id']);
        });

        Schema::table('tvdb_anime_episodes', function (Blueprint $table) {
            $table->dropIndex(['id', 'series_id']);
        });

        Schema::table('anime_episode_mappings', function (Blueprint $table) {
            $table->dropIndex(['id', 'anidb_id', 'tvdb_series_id', 'is_special']);
        });
    }
};
