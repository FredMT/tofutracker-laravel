<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('anidb_seiyuus', function (Blueprint $table) {
            $table->id();
            $table->text('name');
            $table->text('picture')->nullable();
            $table->timestamps();
        });

        Schema::create('anidb_character_seiyuu', function (Blueprint $table) {
            $table->id();
            $table->foreignId('character_id')->references('id')->on('anidb_characters')->onDelete('cascade');
            $table->foreignId('seiyuu_id')->references('id')->on('anidb_seiyuus')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['character_id', 'seiyuu_id']);
        });

        DB::statement('CREATE INDEX anidb_character_seiyuu_id_character_id_seiyuu_id_index ON anidb_character_seiyuu (id, character_id, seiyuu_id)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_character_seiyuu');
        Schema::dropIfExists('anidb_seiyuus');
    }
};
