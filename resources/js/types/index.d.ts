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

interface ExternalIds {
    imdb_id: string | null;
    wikidata_id: string | null;
    facebook_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
}

interface Image {
    aspect_ratio: number;
    height: number;
    file_path: string;
    vote_average: number;
    vote_count: number;
    width: number;
}

interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
}

interface WatchProvider {
    logo_path: string;
    provider_id: number;
    provider_name: string;
    display_priority: number;
}

interface WatchProviderData {
    link: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
}

interface Movie {
    id: number;
    title: string;
    original_title: string;
    original_language: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    runtime: number;
    status: string;
    tagline: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
    budget: number;
    revenue: number;
    genres: Genre[];
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    spoken_languages: SpokenLanguage[];
    credits: {
        cast: CastMember[];
        crew: CrewMember[];
    };
    external_ids: ExternalIds;
    images: {
        backdrops: Image[];
        logos: Image[];
        posters: Image[];
    };
    videos: {
        results: Video[];
    };
    watch_providers: {
        results: Record<string, WatchProviderData>;
    };
    recommendations: {
        results: {
            id: number;
            title: string;
            poster_path: string | null;
            backdrop_path: string | null;
            vote_average: number;
        }[];
    };
    release_dates: {
        results: {
            iso_3166_1: string;
            release_dates: {
                certification: string;
                descriptors: string[];
                iso_639_1: string;
                note: string;
                release_date: string;
                type: number;
            }[];
        }[];
    };
}

export interface MovieProps {
    movie: Movie;
}
