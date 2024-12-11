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
        Schema::create('anidb_anime', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->text('type');
            $table->integer('episode_count');
            $table->date('startdate')->nullable();
            $table->date('enddate')->nullable();
            $table->text('title_main');
            $table->text('title_en')->nullable();
            $table->text('title_ja')->nullable();
            $table->text('title_ko')->nullable();
            $table->text('title_zh')->nullable();
            $table->text('homepage')->nullable();
            $table->text('description')->nullable();
            $table->decimal('rating', 4, 2)->nullable();
            $table->integer('rating_count')->default(0);
            $table->text('picture')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anidb_anime');
    }
};
