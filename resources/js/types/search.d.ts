export interface SearchResults {
    movies: MediaItem[];
    tv: MediaItem[];
    anime: MediaItem[];
}

export interface MediaItem {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    popularity: number;
    vote_average: number;
    genres: Genre[];
    year: number;
    map_id?: number;
}

export interface Genre {
    id: number;
    name: string;
}
