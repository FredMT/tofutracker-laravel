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
        Schema::create('tv_seasons', function (Blueprint $table) {
            $table->bigInteger('id')->primary();
            $table->bigInteger('show_id');
            $table->jsonb('data');
            $table->text('etag');
            $table->timestamps();

            $table->foreign('show_id')
                ->references('id')
                ->on('tv_shows')
                ->onDelete('cascade');

            $table->index('id');
            $table->index('show_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tv_seasons');
    }
};
