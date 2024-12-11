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
        Schema::create('anidb_related_anime', function (Blueprint $table) {
            $table->id();
            $table->foreignId('anime_id')->constrained('anidb_anime')->onDelete('cascade');
            $table->unsignedBigInteger('related_anime_id');
            $table->text('name');
            $table->text('relation_type');
            $table->timestamps();

            $table->unique(['anime_id', 'related_anime_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_related_anime');
    }
};
