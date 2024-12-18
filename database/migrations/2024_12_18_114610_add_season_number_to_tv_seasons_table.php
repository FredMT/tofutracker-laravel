<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tv_seasons', function (Blueprint $table) {
            $table->integer('season_number')->nullable()->after('data');
        });
    }

    public function down()
    {
        Schema::table('tv_seasons', function (Blueprint $table) {
            $table->dropColumn('season_number');
        });
    }
};
