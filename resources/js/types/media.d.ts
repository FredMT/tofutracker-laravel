import { WatchStatus } from "./enums";

export interface MediaEntry {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: number | null;
    rating: number | null;
    watch_status: WatchStatus;
    added_at: string;
    total_episodes?: number;
    watched_episodes?: number;
}
