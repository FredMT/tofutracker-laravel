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
        // For PostgreSQL
        DB::statement('ALTER TABLE anime_maps 
            RENAME CONSTRAINT anime_maps_access_id_unique 
            TO anime_maps_id_unique');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the change
        DB::statement('ALTER TABLE anime_maps 
            RENAME CONSTRAINT anime_maps_id_unique 
            TO anime_maps_access_id_unique');
    }
};
