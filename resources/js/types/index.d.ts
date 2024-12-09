import { Config } from "ziggy-js";
import { WatchStatus } from "./enums";

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

export interface MoviePageProps extends Record<string, unknown> {
    movie: Movie;
    user_library: {
        id: number;
        status: keyof typeof WatchStatus | null;
        rating: number | null;
        is_private: boolean;
    } | null;
    flash: FlashMessage;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    flash: FlashMessage;
    ziggy: Config & { location: string };
};

interface Details {
    budget: number | null;
    revenue: number | null;
    directors: string | null;
    producers: string | null;
    screenplays: string | null;
    novels: string | null;
    writers: string | null;
    original_stories: string | null;
}

interface Genre {
    id: number;
    name: string;
}

interface ProductionCompany {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
}

interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
}

interface CrewMember {
    id: number;
    name: string;
    department: string;
    job: string;
    profile_path: string | null;
}

interface SimilarMovie {
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
}

interface Movie {
    id: number;
    title: string;
    original_title: string;
    certification: string | null;
    original_language: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    logo_path: string | null;
    release_date: string;
    year: number | null;
    runtime: number;
    status: string;
    tagline: string;
    vote_average: number;
    vote_count: number;
    genres: Genre[];
    details: Details;
    credits: {
        cast: CastMember[];
        crew: CrewMember[];
    };
    certification: string | null;
    similar: SimilarMovie[];
}

export interface MovieProps {
    movie: Movie;
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
