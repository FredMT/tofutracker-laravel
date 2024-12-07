import { Config } from "ziggy-js";

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
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
