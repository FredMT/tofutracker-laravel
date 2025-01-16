export type ListPage = {
    id: number;
    title: string;
    user: ListUser;
    banner_image: string | null;
    banner_type: "custom" | "tmdb";
    description: string | null;
    items: ListItem[];
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
    link: string | null;
    poster_path: string;
    poster_type: string;
    title: string;
    vote_average: number;
    year: number;
    sort_order: number;
};
