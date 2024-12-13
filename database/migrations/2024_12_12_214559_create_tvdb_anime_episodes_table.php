<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tvdb_anime_episodes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('series_id');
            $table->boolean('is_movie')->default(false);
            $table->string('name')->nullable();
            $table->date('aired')->nullable();
            $table->unsignedSmallInteger('runtime')->nullable();
            $table->text('overview')->nullable();
            $table->string('image')->nullable();
            $table->unsignedSmallInteger('number')->nullable();
            $table->unsignedInteger('absolute_number')->nullable();
            $table->unsignedSmallInteger('season_number')->nullable();
            $table->timestamp('last_updated')->nullable();
            $table->string('finale_type')->nullable();
            $table->year('year')->nullable();
            $table->foreign('series_id')->references('id')->on('tvdb_anime_seasons')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tvdb_anime_episodes');
    }
};
