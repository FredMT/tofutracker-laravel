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
        Schema::table('anidb_anime', function (Blueprint $table) {
            // Ensure map_id exists before adding foreign key constraint
            $table->unsignedBigInteger('map_id')->nullable()->change();
            $table->foreign('map_id')->references('id')->on('anime_maps')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->dropForeign(['map_id']);
            $table->integer('map_id')->nullable()->change();
        });
    }
};
