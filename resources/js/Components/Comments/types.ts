export interface Comment {
    id: string;
    author: string | null;
    points: number;
    timeAgo: string;
    content: string;
    children?: Comment[];
    isEdited: boolean;
    isDeleted: boolean;
}

export interface CommentThreadProps extends Comment {
    children?: Comment[];
}
