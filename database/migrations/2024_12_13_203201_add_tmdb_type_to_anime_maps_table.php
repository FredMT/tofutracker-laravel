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
        Schema::table('anime_maps', function (Blueprint $table) {
            $table->enum('tmdb_type', ['movie', 'tv'])->nullable()->after('most_common_tmdb_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anime_maps', function (Blueprint $table) {
            $table->dropColumn('tmdb_type');
        });
    }
};
