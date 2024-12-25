import { WatchStatus } from "./enums";

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
