<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('anime_schedule_maps', function (Blueprint $table) {
            $table->string('animeschedule_id')->primary();
            $table->string('animeschedule_route');
            $table->integer('anidb_id');

            $table->unique('animeschedule_route');

            $table->index('anidb_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('anime_schedule_maps');
    }
};
