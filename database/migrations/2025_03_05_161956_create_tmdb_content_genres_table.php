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
        Schema::create('tmdb_content_genres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('genre_id')->constrained('genres')->onDelete('cascade');
            $table->morphs('content');

            // Create a unique constraint for content_type, content_id, and genre_id
            $table->unique(['content_type', 'content_id', 'genre_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_content_genres');
    }
};
