export interface Comment {
    id: string;
    author: string | null;
    points: number;
    timeAgo: string;
    content: string;
    children?: Comment[];
}

export interface CommentThreadProps extends Comment {
    children?: Comment[];
}

export const LINE_COLORS = [
    "bg-gray-700",
    "bg-gray-600",
    "bg-gray-500",
    "bg-gray-400",
    "bg-gray-300",
] as const;
