export interface PageProps extends Record<string, any> {
    errors: Errors;
    auth: Auth;
    flash: Flash;
    userData: UserData;
    movies: Movies;
    genres: Genre[];
    filters: Filters;
}

export interface Auth {
    user: User;
}

export interface User {
    id: number;
    username: string;
    email: string;
    email_verified_at: Date;
    created_at: Date;
    updated_at: Date;
    bio: string;
}

export interface Errors {}

export interface Filters {
    status: string;
    title: string;
    from_date: Date;
    to_date: Date;
    genres: string;
}

export interface Flash {
    success: boolean;
    message: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface Movies {
    current_page: number;
    data: Datum[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Link[];
    next_page_url: string;
    path: string;
    per_page: number;
    prev_page_url: string;
    to: number;
    total: number;
}

export interface Datum {
    id: number;
    title: string;
    poster_path: string;
    release_date: Date;
    rating: number;
    watch_status: string;
    added_at: string;
}

export interface Link {
    url: string;
    label: string;
    active: boolean;
}

export interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar_url: string;
}
