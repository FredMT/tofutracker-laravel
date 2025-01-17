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
    year: number;
    sort_order: number;
};

export type ListStats = {
    anime: number;
    average_rating: number;
    movies: number;
    total: number;
    tv: number;
    total_runtime: string;
};
