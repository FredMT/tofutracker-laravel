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
        Schema::create('tmdb_videos', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('key')->nullable();
            $table->text('name')->nullable();
            $table->string('site')->nullable();
            $table->integer('size')->nullable();
            $table->string('type')->nullable();
            $table->boolean('official')->default(false);
            $table->string('iso_639_1', 2)->nullable();
            $table->string('iso_3166_1', 2)->nullable();
            $table->timestamp('published_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_videos');
    }
};
