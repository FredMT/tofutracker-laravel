import { PageProps } from "@inertiajs/core";
import { WatchStatus } from "./enums";

interface Genre {
    id: number;
    name: string;
}

interface AnimeEntry {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: number | null;
    rating: number | null;
    watch_status: WatchStatus;
    added_at: string;
    total_episodes: number;
    watched_episodes: number;
    sequence_order: number;
}

interface AnimeChain {
    chain_id: number;
    name: string;
    importance_order: number;
    entries: AnimeEntry[];
    type: "chain" | "related";
}

interface AnimeCollection {
    id: number;
    title: string | null;
    poster_path: string | null;
    release_date: number | null;
    rating: number | null;
    watch_status: WatchStatus;
    added_at: string;
    total_episodes: number;
    watched_episodes: number;
    total_seasons: number;
    user_total_seasons: number;
    tmdb_type: "movie" | "tv";
    collection_name: string | null;
    genres: Genre[];
    seasons: AnimeChain[];
    movies: AnimeEntry[];
}

interface UserData {
    id: number;
    username: string;
    created_at: string;
    avatar_url: string | null;
}

interface Filters {
    status?: string;
    title?: string;
    from_date?: string;
    to_date?: string;
    genres?: string;
}

interface Flash {
    success?: boolean;
    message?: string;
}

interface Auth {
    user: {
        id: number;
        name: string;
        email: string;
        username: string;
        avatar_url: string | null;
    } | null;
}

export interface UserAnimePageProps extends PageProps {
    success: boolean;
    messages: string[];
    errors: {
        status?: string;
        genres?: string;
        date?: string;
    };
    userData: UserData;
    collections: AnimeCollection[];
    genres: Genre[];
    filters: Filters;
    flash: Flash;
    auth: Auth;
}
