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
        Schema::table('tv_shows', function (Blueprint $table) {
            $table->float('popularity')->nullable()->index();
            $table->float('vote_average')->nullable()->index();
            $table->unsignedInteger('vote_count')->nullable()->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tv_shows', function (Blueprint $table) {
            $table->dropColumn(['popularity', 'vote_average', 'vote_count']);
        });
    }
};
