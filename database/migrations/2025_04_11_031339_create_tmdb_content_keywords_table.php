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
        Schema::create('tmdb_content_keywords', function (Blueprint $table) {
            $table->id();
            $table->morphs('content');
            $table->unsignedBigInteger('keyword_id');

            $table->index('keyword_id');

            $table->unique(['content_type', 'content_id', 'keyword_id'], 'tmdb_content_keywords_unique');

            $table->foreign('keyword_id')
                ->references('id')
                ->on('tmdb_keywords')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_content_keywords');
    }
};
