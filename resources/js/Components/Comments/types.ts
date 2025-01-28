export interface Comment {
    id: string;
    author: string | null;
    points: number;
    timeAgo: string;
    content: string;
    children?: Comment[];
    isEdited: boolean;
    isDeleted: boolean;
    direction: number;
}

export interface CommentThreadProps extends Comment {
    children?: Comment[];
}

export interface CommentUIState {
    isReplying: string | null;
    isEditing: string | null;
    isCollapsed: string[];
    votes: Record<string, "up" | "down" | null>;
}
