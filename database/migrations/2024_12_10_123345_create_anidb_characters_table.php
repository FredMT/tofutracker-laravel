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
        Schema::create('anidb_characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained('anidb_anime')->onDelete('cascade');
            $table->unsignedBigInteger('character_id');
            $table->text('character_type');
            $table->text('name');
            $table->text('gender')->nullable();
            $table->text('description')->nullable();
            $table->text('picture')->nullable();
            $table->decimal('rating', 4, 2)->nullable();
            $table->integer('rating_votes')->default(0);
            $table->timestamps();

            $table->unique(['anime_id', 'character_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_characters');
    }
};
