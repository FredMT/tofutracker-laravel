import { create } from "zustand";
import { Comment } from "../Components/Comments/types";
import axios from "axios";

interface CommentUIState {
    isReplying: string | null;
    isEditing: string | null;
    isCollapsed: string[];
    votes: Record<string, "up" | "down" | null>;
}

interface CommentStore {
    comments: Comment[];
    uiState: CommentUIState;
    addComment: (
        commentableType: string,
        commentableId: string,
        content: string,
        parentId: string | null
    ) => Promise<void>;
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

    addComment: async (
        commentableType: string,
        commentableId: string,
        content: string,
        parentId: string | null
    ) => {
        const tempId = Math.random().toString();
        const tempComment = {
            id: tempId,
            author: "Current User",
            points: 1,
            timeAgo: "just now",
            content,
            children: [],
        };

        // Optimistic update
        set((state) => {
            if (!parentId) {
                // Add as top-level comment
                return {
                    comments: [tempComment, ...state.comments],
                    uiState: {
                        ...state.uiState,
                        votes: {
                            ...state.uiState.votes,
                            [tempId]: "up",
                        },
                    },
                };
            }

            // Add as reply to parent
            const addReplyToComments = (comments: Comment[]): Comment[] => {
                return comments.map((comment) => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            children: [
                                ...(comment.children || []),
                                tempComment,
                            ],
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
                    votes: {
                        ...state.uiState.votes,
                        [tempId]: "up",
                    },
                },
            };
        });

        try {
            const response = await axios.post(
                `/${commentableType}/${commentableId}/comments`,
                {
                    body: content,
                    parent_id: parentId,
                }
            );

            // Replace temporary comment with real data
            set((state) => {
                if (!parentId) {
                    // Update top-level comment
                    return {
                        comments: state.comments.map((comment) =>
                            comment.id === tempId
                                ? response.data.comment
                                : comment
                        ),
                    };
                }

                // Update reply
                const updateReplyInComments = (
                    comments: Comment[]
                ): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === parentId) {
                            return {
                                ...comment,
                                children: (comment.children || []).map(
                                    (child) =>
                                        child.id === tempId
                                            ? response.data.comment
                                            : child
                                ),
                            };
                        }
                        if (comment.children) {
                            return {
                                ...comment,
                                children: updateReplyInComments(
                                    comment.children
                                ),
                            };
                        }
                        return comment;
                    });
                };

                return {
                    comments: updateReplyInComments(state.comments),
                };
            });
        } catch (error) {
            // Remove temporary comment on error
            set((state) => {
                if (!parentId) {
                    return {
                        comments: state.comments.filter(
                            (comment) => comment.id !== tempId
                        ),
                        uiState: {
                            ...state.uiState,
                            votes: Object.fromEntries(
                                Object.entries(state.uiState.votes).filter(
                                    ([key]) => key !== tempId
                                )
                            ),
                        },
                    };
                }

                // Remove reply
                const removeReplyFromComments = (
                    comments: Comment[]
                ): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === parentId) {
                            return {
                                ...comment,
                                children: (comment.children || []).filter(
                                    (child) => child.id !== tempId
                                ),
                            };
                        }
                        if (comment.children) {
                            return {
                                ...comment,
                                children: removeReplyFromComments(
                                    comment.children
                                ),
                            };
                        }
                        return comment;
                    });
                };

                return {
                    comments: removeReplyFromComments(state.comments),
                    uiState: {
                        ...state.uiState,
                        votes: Object.fromEntries(
                            Object.entries(state.uiState.votes).filter(
                                ([key]) => key !== tempId
                            )
                        ),
                    },
                };
            });
            throw error;
        }
    },

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

    editComment: async (commentId: string, content: string) => {
        // Optimistic update
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
        });

        try {
            const response = await axios.patch(`/comments/${commentId}`, {
                body: content,
            });

            // Update with server response
            set((state) => {
                const updateCommentInTree = (
                    comments: Comment[]
                ): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                content: response.data.content,
                                timeAgo: response.data.timeAgo,
                                points: response.data.points,
                            };
                        }
                        if (comment.children) {
                            return {
                                ...comment,
                                children: updateCommentInTree(comment.children),
                            };
                        }
                        return comment;
                    });
                };

                return {
                    comments: updateCommentInTree(state.comments),
                };
            });
        } catch (error) {
            // Revert optimistic update on error
            set((state) => {
                const revertCommentInTree = (
                    comments: Comment[]
                ): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                content: comment.content, // Original content will be restored
                                timeAgo: comment.timeAgo,
                            };
                        }
                        if (comment.children) {
                            return {
                                ...comment,
                                children: revertCommentInTree(comment.children),
                            };
                        }
                        return comment;
                    });
                };

                return {
                    comments: revertCommentInTree(state.comments),
                    uiState: { ...state.uiState, isEditing: null },
                };
            });
            throw error;
        }
    },

    deleteComment: async (commentId: string) => {
        // Optimistic update
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
        });

        try {
            await axios.delete(`/comments/${commentId}`);
        } catch (error) {
            // Revert optimistic update on error
            set((state) => {
                const revertCommentInTree = (
                    comments: Comment[]
                ): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === commentId) {
                            // Restore original comment state
                            const originalComment = state.comments.find(
                                (c) => c.id === commentId
                            );
                            return originalComment || comment;
                        }
                        if (comment.children) {
                            return {
                                ...comment,
                                children: revertCommentInTree(comment.children),
                            };
                        }
                        return comment;
                    });
                };

                return {
                    comments: revertCommentInTree(state.comments),
                };
            });
            throw error;
        }
    },

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
