import { Comment, CommentUIState } from "../Components/Comments/types";

export interface CommentStore {
    comments: Comment[];
    uiState: CommentUIState;
    addComment: (
        commentableType: string,
        commentableId: string,
        content: string,
        parentId: string | null,
        username: string
    ) => Promise<void>;
    editComment: (commentId: string, content: string) => void;
    deleteComment: (commentId: string) => void;
    setReplying: (commentId: string | null) => void;
    setEditing: (commentId: string | null) => void;
    toggleCollapsed: (commentId: string) => void;
    vote: (commentId: string, direction: "up" | "down" | null) => Promise<void>;
    setInitialComments: (comments: Comment[]) => void;
}
