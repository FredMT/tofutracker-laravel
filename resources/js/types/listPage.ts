export type ListPage = {
    id: number;
    title: string;
    user: ListUser;
    banner_image: string | null;
    banner_type: "custom" | "tmdb";
    description: string | null;
    items: ListItem[];
    is_public: boolean;
    stats: ListStats;
    list_genres: ListItemGenre[];
    is_empty: boolean;
};

type ListUser = {
    id: number;
    avatar: string | null;
    banner: string | null;
    bio: string | null;
    username: string;
};

export type ListItem = {
    id: number;
    item_id: number;
    link: string | null;
    poster_path: string;
    poster_type: string;
    title: string;
    vote_average: number;
    year: string;
    sort_order: number;
    genres: ListItemGenre[];
    created_at: string;
    updated_at: string;
};

export type ListStats = {
    anime: number;
    average_rating: number;
    movies: number;
    total: number;
    tv: number;
    total_runtime: string;
};

export type ListItemGenre = {
    id: number;
    name: string;
};
