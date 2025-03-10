<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->integer('map_id')->nullable()->after('anidb_id');
        });
    }

    public function down(): void
    {
        Schema::table('anidb_anime', function (Blueprint $table) {
            $table->dropColumn('map_id');
        });
    }
};
