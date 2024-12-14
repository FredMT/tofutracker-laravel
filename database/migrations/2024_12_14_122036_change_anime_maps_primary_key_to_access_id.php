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
            // Drop the uuid primary key
            $table->dropPrimary();
            $table->dropColumn('id');

            // Make access_id the primary key
            $table->primary('access_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('anime_maps', function (Blueprint $table) {
            // Remove access_id as primary key
            $table->dropPrimary();

            // Restore original uuid primary key
            $table->uuid('id')->first()->primary();
        });
    }
};
