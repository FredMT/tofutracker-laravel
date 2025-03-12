<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('anime_schedules', function (Blueprint $table) {
            $table->integer('episode_number')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('anime_schedules', function (Blueprint $table) {
            $table->dropColumn('episode_number');
        });
    }
};
