<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('tvdb_anime_seasons', function (Blueprint $table) {
            $table->timestamp('last_fetched_at')->nullable();
        });
    }

    public function down()
    {
        Schema::table('tvdb_anime_seasons', function (Blueprint $table) {
            $table->dropColumn('last_fetched_at');
        });
    }
};
