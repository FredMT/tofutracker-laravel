<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('activity_type'); // e.g., 'anime_watch', 'anime_batch_watch'
            $table->string('subject_type'); // e.g., 'UserAnimeEpisode', 'UserAnime'
            $table->unsignedBigInteger('subject_id');
            $table->text('description');
            $table->json('metadata')->nullable(); // For storing anime_id, anidb_id, episode info, etc
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_activities');
    }
};
