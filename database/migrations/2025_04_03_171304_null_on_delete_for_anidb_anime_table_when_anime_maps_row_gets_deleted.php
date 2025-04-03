<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->bigInteger('map_id')->nullable()->change();
            $table->dropForeign(['map_id']);
            $table->foreign('map_id')->references('id')->on('anime_maps')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->dropForeign(['map_id']);
            $table->foreign('map_id')->references('id')->on('anime_maps')->cascadeOnDelete();
        });
    }
};
