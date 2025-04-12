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
        Schema::create('tmdb_content_videos', function (Blueprint $table) {
            $table->unsignedBigInteger('content_id');
            $table->string('content_type');
            $table->string('video_id');

            $table->foreign('video_id')->references('id')->on('tmdb_videos')->onDelete('cascade');

            // Adding index for morph relation
            $table->index(['content_id', 'content_type']);

            // Primary key
            $table->primary(['content_id', 'content_type', 'video_id'], 'tmdb_content_videos_primary');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tmdb_content_videos');
    }
};
