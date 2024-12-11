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
        Schema::create('tv_episodes', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->bigInteger('show_id');
            $table->bigInteger('season_id');
            $table->jsonb('data');
            $table->text('etag');
            $table->timestamps();

            $table->foreign('show_id')
                ->references('id')
                ->on('tv_shows')
                ->onDelete('cascade');

            $table->foreign('season_id')
                ->references('id')
                ->on('tv_seasons')
                ->onDelete('cascade');

            $table->index('id');
            $table->index('show_id');
            $table->index('season_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tv_episodes');
    }
};
