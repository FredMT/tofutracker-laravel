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
        Schema::create('anidb_tags', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->unique();
            $table->text('name')->index();
            $table->text('description');
        });

        Schema::create('anidb_anime_tags', function (Blueprint $table) {
            $table->foreignId('anidb_id')->references('id')->on('anidb_anime')->cascadeOnDelete();
            $table->foreignId('tag_id')->references('id')->on('anidb_tags')->cascadeOnDelete();
            $table->unique(['anidb_id', 'tag_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_anime_tags');
        Schema::dropIfExists('anidb_tags');
    }
};
