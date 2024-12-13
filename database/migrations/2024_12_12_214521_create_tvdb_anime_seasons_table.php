<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('tvdb_anime_seasons', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->string('status_name');
            $table->string('status_record_type');
            $table->boolean('status_keep_updated');
            $table->timestamp('last_updated')->nullable();
            $table->unsignedSmallInteger('average_runtime')->nullable();
        });
    }

    public function down()
    {
        Schema::dropIfExists('tvdb_anime_seasons');
    }
};
