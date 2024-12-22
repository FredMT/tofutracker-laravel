<?php

use App\Enums\WatchStatus;
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
        Schema::create('user_anime_episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_anime_id')->constrained('user_animes')->cascadeOnDelete();
            $table->integer('episode_id');
            $table->float('rating')->nullable();
            $table->boolean('is_special');
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->timestamps();

            $table->unique(['user_anime_id', 'episode_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_anime_episodes');
    }
};
