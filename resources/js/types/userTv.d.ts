import { WatchStatus } from "./enums";
import { PageProps as InertiaPageProps } from "@inertiajs/core";

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified_at: Date;
    created_at: Date;
    updated_at: Date;
    bio: string;
}

export interface Auth {
    user: User | null;
}

export interface Flash {
    success?: boolean;
    message?: string;
}

export interface UserTvShow {
    id: number;
    title: string | null;
    poster_path: string | null;
    release_date: number | null;
    rating: number | null;
    watch_status: WatchStatus;
    added_at: string;
    seasons: UserTvSeason[];
}

export interface UserTvSeason {
    id: number;
    title: string | null;
    poster_path: string | null;
    release_date: number | null;
    rating: number | null;
    watch_status: WatchStatus;
    added_at: string;
    season_number: number;
    watched_episodes: number;
    total_episodes: number;
}

export interface UserTvGenre {
    id: number;
    name: string;
}

export interface UserTvFilters {
    status: WatchStatus | null;
    title: string | null;
    from_date: string | null;
    to_date: string | null;
    genres: string | null;
}

export interface UserData {
    id: number;
    username: string;
    created_at: string;
    avatar_url: string | null;
}

export interface UserTvApiResponse {
    success: boolean;
    messages: string[];
    errors: {
        status?: string;
        genres?: string;
        dates?: string;
    };
    data: {
        shows: UserTvShow[];
        genres: UserTvGenre[];
        filters: UserTvFilters;
        userData: UserData;
    };
}

export interface PageProps extends InertiaPageProps {
    auth: Auth;
    flash: Flash;
    errors: Record<string, string>;
    userData: UserData;
    data: UserTvApiResponse;
}
