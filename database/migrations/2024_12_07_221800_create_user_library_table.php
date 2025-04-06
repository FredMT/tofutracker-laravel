<?php

use App\Enums\WatchStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_library', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('media_id');
            $table->string('media_type'); // 'movie', 'tv', 'anime'
            $table->enum('status', array_column(WatchStatus::cases(), 'value'));
            $table->unsignedTinyInteger('rating')->nullable()->default(null);
            $table->timestamps();

            // Composite unique index to prevent duplicate entries
            $table->unique(['user_id', 'media_id', 'media_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_library');
    }
};
