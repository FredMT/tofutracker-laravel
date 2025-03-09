<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('anime_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('animeschedule_id');
            $table->string('title')->nullable();
            $table->timestamp('episode_date')->nullable();
            $table->integer('year');
            $table->integer('week');

            // Foreign key reference to anime_schedule_maps
            $table->foreign('animeschedule_id')
                ->references('animeschedule_id')
                ->on('anime_schedule_maps')
                ->onDelete('cascade');

            $table->unique(['animeschedule_id', 'year', 'week']);

            $table->index(['year', 'week']);
            $table->index('episode_date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('anime_schedules');
    }
};
