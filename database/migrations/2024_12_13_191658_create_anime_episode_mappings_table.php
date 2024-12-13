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
        Schema::create('anime_episode_mappings', function (Blueprint $table) {
            $table->id();
            $table->integer('anidb_id')->index();
            $table->integer('tvdb_series_id')->index();
            $table->integer('tvdb_episode_id');
            $table->integer('anidb_episode_number')->nullable();
            $table->boolean('is_special')->default(false);
            $table->integer('tvdb_season_number');
            $table->integer('tvdb_episode_number');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::dropIfExists('anime_episode_mappings');
    }
};
