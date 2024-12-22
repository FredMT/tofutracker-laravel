<?php

use App\Enums\WatchStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // User TV Shows
        Schema::create('user_tv_shows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_library_id')->constrained('user_libraries')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('show_id')->constrained('tv_shows')->cascadeOnDelete();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->float('rating')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'show_id']);
        });

        // User TV Seasons
        Schema::create('user_tv_seasons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_tv_show_id')->constrained('user_tv_shows')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('show_id')->constrained('tv_shows')->cascadeOnDelete();
            $table->foreignId('season_id')->constrained('tv_seasons')->cascadeOnDelete();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->float('rating')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'season_id']);
        });

        // User TV Episodes
        Schema::create('user_tv_episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_tv_season_id')->constrained('user_tv_seasons')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('show_id')->constrained('tv_shows')->cascadeOnDelete();
            $table->foreignId('season_id')->constrained('tv_seasons')->cascadeOnDelete();
            $table->foreignId('episode_id')->constrained('tv_episodes')->cascadeOnDelete();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'));
            $table->float('rating')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'episode_id']);
        });

        // Play Records
        Schema::create('user_tv_plays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('show_id')->constrained('tv_shows')->cascadeOnDelete();
            $table->foreignId('season_id')->nullable()->constrained('tv_seasons')->cascadeOnDelete();
            $table->foreignId('episode_id')->nullable()->constrained('tv_episodes')->cascadeOnDelete();
            $table->morphs('playable');
            $table->timestamp('watched_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_tv_plays');
        Schema::dropIfExists('user_tv_episodes');
        Schema::dropIfExists('user_tv_seasons');
        Schema::dropIfExists('user_tv_shows');
    }
};
