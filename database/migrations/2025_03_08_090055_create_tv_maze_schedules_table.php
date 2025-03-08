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
        Schema::create('tv_maze_schedules', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->string('name')->nullable();
            $table->timestamp('airstamp')->nullable();
            $table->integer('runtime')->nullable();
            $table->text('summary')->nullable();
            $table->bigInteger('thetvdb_id')->nullable();
            $table->string('official_site')->nullable();
            $table->jsonb('schedule')->nullable();
            $table->jsonb('web_channel')->nullable();

            $table->index('thetvdb_id');
            $table->index('airstamp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tv_maze_schedules');
    }
};
