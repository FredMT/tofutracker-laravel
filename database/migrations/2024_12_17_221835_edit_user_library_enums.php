<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create the enum types in PostgreSQL
        DB::statement('DROP TYPE IF EXISTS media_type_enum');
        DB::statement("CREATE TYPE media_type_enum AS ENUM ('movie', 'tv', 'anime')");

        DB::statement('DROP TYPE IF EXISTS watch_status_enum');
        DB::statement("CREATE TYPE watch_status_enum AS ENUM ('COMPLETED', 'PLANNING', 'REWATCHING', 'WATCHING', 'ONHOLD', 'DROPPED')");

        // Modify the columns to use the new enum types
        DB::statement('ALTER TABLE user_library ALTER COLUMN media_type TYPE media_type_enum USING media_type::media_type_enum');
        DB::statement('ALTER TABLE user_library ALTER COLUMN status TYPE watch_status_enum USING status::watch_status_enum');
    }

    public function down(): void
    {
        // Convert back to varchar
        DB::statement('ALTER TABLE user_library ALTER COLUMN media_type TYPE varchar(255) USING media_type::varchar');
        DB::statement('ALTER TABLE user_library ALTER COLUMN status TYPE varchar(255) USING status::varchar');

        // Drop the enum types
        DB::statement('DROP TYPE IF EXISTS media_type_enum');
        DB::statement('DROP TYPE IF EXISTS watch_status_enum');
    }
};
