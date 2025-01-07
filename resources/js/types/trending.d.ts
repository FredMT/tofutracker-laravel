export interface TrendingContent {
    movies: Movie[];
    tv_shows: Movie[];
    anime: Anime[];
}

export interface Anime {
    title: string;
    release_date: string;
    genres: string[];
    overview: string;
    backdrop_path: string;
    poster_path: string;
    logo_path: null | string;
    popularity: number;
    vote_average: number;
    link: string;
    type: AnimeType;
}

export enum AnimeType {
    Anime = "anime",
}

export interface Movie {
    title: string;
    release_date: string;
    genres: string[];
    overview: string;
    backdrop_path: string;
    poster_path: string;
    logo_path: null | string;
    vote_average: number;
    popularity: number;
    link: number;
    type: RegularType;
}

export enum RegularType {
    Movie = "movie",
    Tv = "tv",
}
