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
        Schema::table('anidb_seiyuus', function (Blueprint $table) {
            $table->integer('tmdb_id')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anidb_seiyuus', function (Blueprint $table) {
            $table->dropColumn('tmdb_id');
        });
    }
};
