<?php

namespace Database\Seeders;

use App\Models\Tmdb\Genre;
use Illuminate\Database\Seeder;

class GenresSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Movie genres
        $movieGenres = [
            ['id' => 28, 'name' => 'Action'],
            ['id' => 12, 'name' => 'Adventure'],
            ['id' => 16, 'name' => 'Animation'],
            ['id' => 35, 'name' => 'Comedy'],
            ['id' => 80, 'name' => 'Crime'],
            ['id' => 99, 'name' => 'Documentary'],
            ['id' => 18, 'name' => 'Drama'],
            ['id' => 10751, 'name' => 'Family'],
            ['id' => 14, 'name' => 'Fantasy'],
            ['id' => 36, 'name' => 'History'],
            ['id' => 27, 'name' => 'Horror'],
            ['id' => 10402, 'name' => 'Music'],
            ['id' => 9648, 'name' => 'Mystery'],
            ['id' => 10749, 'name' => 'Romance'],
            ['id' => 878, 'name' => 'Science Fiction'],
            ['id' => 10770, 'name' => 'TV Movie'],
            ['id' => 53, 'name' => 'Thriller'],
            ['id' => 10752, 'name' => 'War'],
            ['id' => 37, 'name' => 'Western'],
        ];

        // TV show genres
        $tvGenres = [
            ['id' => 10759, 'name' => 'Action & Adventure'],
            // Animation is already in movie genres (id 16)
            // Comedy is already in movie genres (id 35)
            // Crime is already in movie genres (id 80)
            // Documentary is already in movie genres (id 99)
            // Drama is already in movie genres (id 18)
            // Family is already in movie genres (id 10751)
            ['id' => 10762, 'name' => 'Kids'],
            // Mystery is already in movie genres (id 9648)
            ['id' => 10763, 'name' => 'News'],
            ['id' => 10764, 'name' => 'Reality'],
            ['id' => 10765, 'name' => 'Sci-Fi & Fantasy'],
            ['id' => 10766, 'name' => 'Soap'],
            ['id' => 10767, 'name' => 'Talk'],
            ['id' => 10768, 'name' => 'War & Politics'],
            // Western is already in movie genres (id 37)
        ];

        // Merge genres from movies and TV shows, avoiding duplicates
        $allGenres = array_merge($movieGenres, $tvGenres);

        // Insert all genres
        foreach ($allGenres as $genre) {
            Genre::updateOrCreate(
                ['id' => $genre['id']],
                ['name' => $genre['name']]
            );
        }
    }
}
