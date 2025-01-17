export interface SearchResult {
    id: number;
    title: string;
    media_type: string;
    year: string;
    poster_path: string | null;
    genres: string[];
}

export interface SearchResponse {
    results: { [key: string]: SearchResult };
}
