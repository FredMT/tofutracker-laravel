export interface GenresAndWatchProvidersHomepage {
    by_genre: { [key: string]: ByGenre };
    by_provider: { [key: string]: ByProvider };
}

export interface ByGenre {
    genre_name: string;
    items: Item[];
}

export interface Item {
    id: number;
    media_type: MediaType;
    title: string;
    release_date: string;
    vote_average: number;
    popularity: number;
    poster_path: null | string;
    backdrop_path: null | string;
    original_media_type?: MediaType;
    anime_id?: number;
}

export enum MediaType {
    Anime = "anime",
    Movie = "movie",
    Tv = "tv",
}

export interface ByProvider {
    provider_name: string;
    provider_logo: string;
    items: Item[];
}
