export interface AnimeCollectionEntry {
    entry_id: number;
    entry_sequence_order: number;
    anime_id: number;
    title: string;
    anidb_poster: string | null;
    year: number | null;
    rating: string | null;
    episode_count: number;
    runtime: number;
}

export interface AnimeCollectionChain {
    id: number;
    name: string;
    importance_order: number;
    entries: AnimeCollectionEntry[];
}

export interface AnimeRelatedEntry {
    related_entry_id: number;
    anime_id: number;
    title: string;
    anidb_poster: string | null;
    year: number | null;
    rating: string | null;
    episode_count: number;
    runtime: number;
}

export interface AnimeCollection {
    id: number;
    collection_name: string | null;
    most_common_tmdb_id: number | null;
    tmdb_type: string | null;
    title: string | null;
    tmdb_poster: string | null;
    chains: AnimeCollectionChain[];
    related_entries: AnimeRelatedEntry[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface AnimeCollectionsResponse {
    data: AnimeCollection[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
