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
        Schema::create('user_anime_collections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_library_id')->constrained('user_libraries');
            $table->foreignId('map_id')->constrained('anime_maps');
            $table->float('rating')->nullable();
            $table->enum('watch_status', array_column(WatchStatus::cases(), 'value'))->nullable();
            $table->timestamps();
            $table->unique(['user_library_id', 'map_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_anime_collections');
    }
};
