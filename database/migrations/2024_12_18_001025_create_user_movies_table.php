<?php

use App\Enums\WatchStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_movies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_library_id')->constrained('user_libraries')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('movie_id')->constrained('movies')->cascadeOnDelete();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->float('rating')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'movie_id']);
        });

        Schema::create('user_movie_plays', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_movie_id')->constrained('user_movies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('movie_id')->constrained('movies')->cascadeOnDelete();
            $table->timestamp('watched_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_movie_plays');
        Schema::dropIfExists('user_movies');
    }
};
