import { Anime } from "@/types/anime";
import { Config } from "ziggy-js";
import { WatchStatus } from "./enums";
import { AnimeSeason } from "@/types/animeseason";

export interface Auth {
    user: User | null;
}

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
    avatar?: string;
    banner?: string;
    bio?: string;
}

interface FlashMessage {
    success: boolean;
    message: string;
}

interface BaseUserLibrary {
    type: "movie" | "tv" | "tvseason";
    id: number;
    watch_status: string | null;
    rating: number | null;
    episodes?: {
        episode_id: number;
        watch_status: string | null;
        rating: number | null;
    }[];
}

export interface AnimeSeasonUserLibrary {
    id: number;
    watch_status: WatchStatus;
    rating: number | null;
    episodes?: {
        id: number;
        user_id: number | null;
        user_anime_id: number;
        episode_id: number;
        watch_status: WatchStatus;
        rating: number | null;
        is_special: boolean;
    }[];
}

interface AnimeUserLibrary {
    type: "animemovie" | "animetv" | "animeseason";
    collection: {
        id: number;
        user_library_id: number;
        map_id: number;
        rating: number | null;
        watch_status: WatchStatus;
    };
    anime: {
        id: number;
        anidb_id: number | null;
        is_movie: boolean;
        rating: number | null;
        watch_status: WatchStatus;
    }[];
}

type UserLibrary = BaseUserLibrary | AnimeUserLibrary;

type ContentTypeToLibrary<T> = T extends { type: "movie" | "tv" | "tvseason" }
    ? BaseUserLibrary
    : T extends { type: "animeseason" }
    ? AnimeSeasonUserLibrary
    : T extends { type: "animemovie" | "animetv" }
    ? AnimeUserLibrary
    : never;

export interface Links {
    show: {
        url: string;
        name: string | null;
    };
    seasons: Array<{
        url: string;
        name: string;
        season_number?: number;
        is_current: boolean;
    }>;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: Auth;
    type: ContentType;
    flash?: FlashMessage;
    ziggy: Config & { location: string };
    user_library: ContentTypeToLibrary<T> | null;
    permissions: {
        is_superuser: boolean;
    };
} & (
        | { type: "movie" }
        | { type: "tv" }
        | { type: "tvseason" }
        | { type: "animetv" }
        | { type: "animemovie" }
    );

interface BaseContent {
    id: number;
    title: string;
    original_title: string;
    original_language: string;
    overview: string;
    poster_path: string;
    backdrop_path: string;
    logo_path: string;
    year: number;
    status: string;
    tagline: string;
    vote_average: number;
    vote_count: number;
    genres: Genre[];
    credits: Credits;
    certification: string;
    similar: Similar[];
    recommended: Recommended[];
    runtime?: string;
    release_date?: string;
    first_air_date?: string;
}

export type TvSeason = BaseContent & {
    season_number: number;
    air_date: string;
    episodes: Episode[];
    show_id: number;
};

export type Movie = BaseContent & {
    release_date: string;
    runtime: string;
    details: MovieDetails;
    trailer: Trailer | null;
};

// TV-specific content
export type TvShow = BaseContent & {
    first_air_date: string;
    last_air_date: string;
    details: TvDetails;
    seasons: Season[];
    network: Network;
    episode_runtime: any[];
    in_production: boolean;
    type: string;
    number_of_episodes: number;
    number_of_seasons: number;
    trailer: Trailer | null;
};

interface Trailer {
    link: string;
    name: string;
}

interface Genre {
    id: number;
    name: string;
}

// Updated Credits interfaces
interface Credits {
    cast: Person[];
    crew: Person[];
}

interface BaseCastCrew {
    id: number;
    name: string;
    profile_path: string | null;
}

interface Cast extends BaseCastCrew {
    character: string;
    order: number;
    total_episodes?: number; // Optional for TV shows
}

interface Crew extends BaseCastCrew {
    job: string;
    popularity: number;
    total_episodes?: number; // Optional for TV shows
}

interface BaseDetails {
    status?: string;
    production_companies?: string;
}

interface MovieDetails extends BaseDetails {
    budget: number;
    revenue: number;
    producers: string;
    screenplays: string;
    novels: string;
    directors: string;
    original_stories?: string;
    writers?: string;
}

interface TvDetails extends BaseDetails {
    episodes: number;
    seasons: number;
    creators: string;
    networks: string;
}

interface Season {
    id: number;
    show_id: number;
    name: string;
    overview: string;
    season_number: number;
    episode_count: number;
    air_date: string;
    vote_average: number;
    poster_path: string;
}

interface Network {
    id: number;
    name: string;
    logo_path: string;
    origin_country: string;
}

interface Similar {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: Date;
}

interface Recommended {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: Date;
}

interface ContentCreditsProps {
    containerWidth: number;
    slideSize?: string;
}

interface Person extends BaseCastCrew {
    character?: string;
    job?: string;
    order?: number;
    popularity?: number;
    total_episodes?: number;
}

interface ContentSummaryProps {
    containerWidth?: number;
    slideSize?: string;
}

export interface Episode {
    id: number;
    name: string;
    overview: string | null;
    episode_number: number;
    air_date: string | null;
    still_path: string | null;
    vote_average: number | null;
    runtime: number | null;
}

interface BasePerson {
    id: number;
    name: string;
    picture: string;
}

interface TmdbPerson extends BasePerson {
    profile_path: string;
    character?: string;
    job?: string;
    order?: number;
    popularity?: number;
    total_episodes?: number;
}

interface AnimePerson extends BasePerson {
    seiyuu?: string; // For cast members
    characters?: string; // For crew members
}

export type ContentType =
    | "movie"
    | "tv"
    | "tvseason"
    | "animetv"
    | "animemovie"
    | "animeseason";
export type AnimeType = "animemovie" | "animetv" | "animeseason";
export type RegularType = "movie" | "tv" | "tvseason";
export type AnimeContentDataType = Anime | AnimeSeason;
export type RegularContentDataType = Movie | TvShow | Tvseason;
