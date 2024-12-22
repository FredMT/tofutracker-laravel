<?php

use App\Enums\WatchStatus;
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
        Schema::create('user_animes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_anime_collection_id')->constrained('user_anime_collections')->cascadeOnDelete();
            $table->foreignId('anidb_id')->constrained('anidb_anime');
            $table->boolean('is_movie')->default(false);
            $table->float('rating')->nullable();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_animes');
    }
};
