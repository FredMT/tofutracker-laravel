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
            // Rename access_id to id
            $table->renameColumn('access_id', 'id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anime_maps', function (Blueprint $table) {
            // Rename id back to access_id
            $table->renameColumn('id', 'access_id');
        });
    }
};
