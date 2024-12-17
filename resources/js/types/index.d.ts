import { Anime } from "@/types/anime";
import { Config } from "ziggy-js";
import { WatchStatus } from "./enums";
import { AnimeSeason } from "@/types/animeseason";

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified_at?: string;
    created_at: string;
}

interface FlashMessage {
    success: boolean;
    message: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    movie?: Movie;
    tv?: TvShow;
    animetv?: Anime;
    animemovie?: Anime;
    animeseason?: AnimeSeason;
    flash?: FlashMessage;
    ziggy: Config & { location: string };
    user_library?: {
        id: number;
        status: keyof typeof WatchStatus | null;
        rating: number | null;
        is_private: boolean;
    } | null;
} & (
        | { type: "movie"; movie: Movie }
        | { type: "tv"; tv: TvShow }
        | { type: "tvseason"; tvseason: TvSeason }
        | { type: "animetv"; animetv: Main }
        | { type: "animemovie"; animemovie: Main }
        | { type: "animeseason"; animemovie: AnimeSeason }
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

interface TvSeason extends BaseContent {
    season_number: number;
    air_date: string;
    episodes: Episode[];
}

export interface Movie extends BaseContent {
    release_date: string;
    runtime: string;
    details: MovieDetails;
}

// TV-specific content
export interface TvShow extends BaseContent {
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

export interface LibraryEntry {
    id: number;
    media_id: number;
    media_type: string;
    status: WatchStatus;
    rating: number | null;
    is_private: boolean;
    created_at: string;
    movie_data?: {
        poster_path: string;
        title: string;
    };
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
    overview: string;
    episode_number: number;
    air_date: string;
    still_path: string;
    vote_average?: number;
    runtime: number;
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

interface ContentCreditsProps {
    containerWidth: number;
    slideSize?: string;
}
