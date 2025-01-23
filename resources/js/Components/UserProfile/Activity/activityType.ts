export type Activity = {
    activity_type: string;
    id: number;
    description: string;
    occurred_at_diff: string;
    metadata: Record<string, any>;
};

export type PaginationData = {
    current_page: number;
    data: Activity[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type ListItem = {
    id: number;
    type: string;
    title: string;
    link: string;
    poster_path: string | null;
    poster_type: string;
};
