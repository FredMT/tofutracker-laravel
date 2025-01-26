import { create } from "zustand";
import { Comment } from "../Components/Comments/types";

interface CommentUIState {
    isReplying: string | null;
    isEditing: string | null;
    isCollapsed: string[];
    votes: Record<string, "up" | "down" | null>;
}

interface CommentStore {
    comments: Comment[];
    uiState: CommentUIState;
    addComment: (content: string) => void;
    addReply: (parentId: string, content: string) => void;
    editComment: (commentId: string, content: string) => void;
    deleteComment: (commentId: string) => void;
    setReplying: (commentId: string | null) => void;
    setEditing: (commentId: string | null) => void;
    toggleCollapsed: (commentId: string) => void;
    vote: (commentId: string, direction: "up" | "down" | null) => void;
    setInitialComments: (comments: Comment[]) => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
    comments: [],
    uiState: {
        isReplying: null,
        isEditing: null,
        isCollapsed: [],
        votes: {},
    },

    setInitialComments: (comments: Comment[]) =>
        set(() => ({
            comments,
        })),

    addComment: (content: string) =>
        set((state) => {
            const newCommentId = Math.random().toString();
            const newComment: Comment = {
                id: newCommentId,
                author: "Current User", // TODO: Get from auth
                points: 1, // Start with 1 point for auto-upvote
                timeAgo: "just now",
                content,
            };
            return {
                comments: [newComment, ...state.comments],
                uiState: {
                    ...state.uiState,
                    votes: {
                        ...state.uiState.votes,
                        [newCommentId]: "up", // Auto-upvote
                    },
                },
            };
        }),

    addReply: (parentId: string, content: string) =>
        set((state) => {
            const newCommentId = Math.random().toString();
            const newComment: Comment = {
                id: newCommentId,
                author: "Current User", // TODO: Get from auth
                points: 1, // Start with 1 point for auto-upvote
                timeAgo: "just now",
                content,
            };

            const addReplyToComments = (comments: Comment[]): Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            children: [...(comment.children || []), newComment],
                        };
                    }
                    if (comment.children) {
                        return {
                            ...comment,
                            children: addReplyToComments(comment.children),
                        };
                    }
                    return comment;
                });
            };

            return {
                comments: addReplyToComments(state.comments),
                uiState: {
                    ...state.uiState,
                    isReplying: null,
                    votes: {
                        ...state.uiState.votes,
                        [newCommentId]: "up", // Auto-upvote
                    },
                },
            };
        }),

    editComment: (commentId: string, content: string) =>
        set((state) => {
            const editCommentInTree = (comments: Comment[]): Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            content,
                            timeAgo: "edited just now",
                        };
                    }
                    if (comment.children) {
                        return {
                            ...comment,
                            children: editCommentInTree(comment.children),
                        };
                    }
                    return comment;
                });
            };

            return {
                comments: editCommentInTree(state.comments),
                uiState: { ...state.uiState, isEditing: null },
            };
        }),

    deleteComment: (commentId: string) =>
        set((state) => {
            const deleteCommentInTree = (comments: Comment[]): Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            author: "[removed]",
                            content: "[deleted]",
                        };
                    }
                    if (comment.children) {
                        return {
                            ...comment,
                            children: deleteCommentInTree(comment.children),
                        };
                    }
                    return comment;
                });
            };

            return {
                comments: deleteCommentInTree(state.comments),
            };
        }),

    setReplying: (commentId: string | null) =>
        set((state) => ({
            uiState: { ...state.uiState, isReplying: commentId },
        })),

    setEditing: (commentId: string | null) =>
        set((state) => ({
            uiState: { ...state.uiState, isEditing: commentId },
        })),

    toggleCollapsed: (commentId: string) =>
        set((state) => {
            const isCollapsed = state.uiState.isCollapsed;
            const newIsCollapsed = isCollapsed.includes(commentId)
                ? isCollapsed.filter((id) => id !== commentId)
                : [...isCollapsed, commentId];

            return {
                uiState: { ...state.uiState, isCollapsed: newIsCollapsed },
            };
        }),

    vote: (commentId: string, direction: "up" | "down" | null) =>
        set((state) => {
            const updatePointsInTree = (comments: Comment[]): Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === commentId) {
                        const currentVote = state.uiState.votes[commentId];
                        let pointsDiff = 0;

                        // Remove previous vote if exists
                        if (currentVote === "up") pointsDiff -= 1;
                        if (currentVote === "down") pointsDiff += 1;

                        // Add new vote
                        if (direction === "up") pointsDiff += 1;
                        if (direction === "down") pointsDiff -= 1;

                        return {
                            ...comment,
                            points: comment.points + pointsDiff,
                        };
                    }
                    if (comment.children) {
                        return {
                            ...comment,
                            children: updatePointsInTree(comment.children),
                        };
                    }
                    return comment;
                });
            };

            return {
                comments: updatePointsInTree(state.comments),
                uiState: {
                    ...state.uiState,
                    votes: {
                        ...state.uiState.votes,
                        [commentId]: direction,
                    },
                },
            };
        }),
}));
