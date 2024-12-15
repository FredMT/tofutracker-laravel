<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table for storing chain groups
        Schema::create('anime_prequel_sequel_chains', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('map_id');
            $table->string('name')->nullable();
            $table->unsignedInteger('importance_order')->default(1);
            $table->timestamps();

            $table->foreign('map_id')
                ->references('id')
                ->on('anime_maps')
                ->onDelete('cascade');
        });

        // Table for storing ordered anime IDs within each chain
        Schema::create('anime_chain_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chain_id')
                ->constrained('anime_prequel_sequel_chains')
                ->onDelete('cascade');
            $table->unsignedBigInteger('anime_id');
            $table->unsignedInteger('sequence_order');
            $table->timestamps();

            // Ensure unique ordering within a chain
            $table->unique(['chain_id', 'sequence_order']);
            // Ensure an anime ID appears only once in a chain
            $table->unique(['chain_id', 'anime_id']);
        });

        // Table for storing other related anime IDs
        Schema::create('anime_related_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('map_id')
                ->constrained('anime_maps')
                ->onDelete('cascade');
            $table->unsignedBigInteger('anime_id');
            $table->timestamps();

            // Ensure an anime ID appears only once per map
            $table->unique(['map_id', 'anime_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('anime_chain_entries');
        Schema::dropIfExists('anime_prequel_sequel_chains');
        Schema::dropIfExists('anime_related_entries');
    }
};
