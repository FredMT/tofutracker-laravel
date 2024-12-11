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
        Schema::create('anidb_episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained('anidb_anime')->onDelete('cascade');
            $table->unsignedBigInteger('episode_id')->unique();
            $table->text('episode_number');
            $table->text('type');
            $table->text('prefix')->nullable();
            $table->integer('length')->nullable();
            $table->date('airdate')->nullable();
            $table->text('title_en')->nullable();
            $table->text('title_ja')->nullable();
            $table->text('summary')->nullable();
            $table->decimal('rating', 4, 2)->nullable();
            $table->integer('rating_votes')->default(0);
            $table->text('resource_type')->nullable();
            $table->text('resource_identifier')->nullable();
            $table->timestamps();

            $table->unique(['anime_id', 'episode_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_episodes');
    }
};
