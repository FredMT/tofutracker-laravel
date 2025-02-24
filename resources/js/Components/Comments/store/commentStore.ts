import { create } from "zustand";
import axios from "axios";
import { CommentStore } from "@/stores/types";
import { Comment } from "@/Components/Comments/types";

export const useCommentStore = create<CommentStore>((set) => ({
    comments: [],
    uiState: {
        isReplying: null,
        isEditing: null,
        isCollapsed: [],
        votes: {},
    },

    setInitialComments: (comments: Comment[]) =>
        set((state) => {
            // Initialize votes based on comment directions
            const initialVotes = comments.reduce((acc, comment) => {
                if (comment.direction === 1) {
                    acc[comment.id] = "up";
                } else if (comment.direction === -1) {
                    acc[comment.id] = "down";
                }
                // Recursively process children
                if (comment.children) {
                    comment.children.forEach((child) => {
                        if (child.direction === 1) {
                            acc[child.id] = "up";
                        } else if (child.direction === -1) {
                            acc[child.id] = "down";
                        }
                    });
                }
                return acc;
            }, {} as Record<string, "up" | "down" | null>);

            return {
                comments,
                uiState: {
                    ...state.uiState,
                    votes: initialVotes,
                },
            };
        }),

    addComment: async (
        commentableType: string,
        commentableId: string,
        content: string,
        parentId: string | null,
        username: string
    ) => {
        const tempId = Math.random().toString();
        const tempComment = {
            id: tempId,
            author: username,
            points: 1,
            timeAgo: "just now",
            content,
            children: [],
            isEdited: false,
            isDeleted: false,
            direction: 1,
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

    vote: async (commentId: string, direction: "up" | "down" | null) => {
        try {
            const response = await axios.post("/votes", {
                commentId,
                direction:
                    direction === "up" ? 1 : direction === "down" ? -1 : 0,
            });

            const serverDirection = response.data.direction;
            const newDirection =
                serverDirection === 1
                    ? "up"
                    : serverDirection === -1
                    ? "down"
                    : null;

            set((state) => {
                let targetComment: Comment | null = null;
                const findComment = (comments: Comment[]): Comment[] => {
                    return comments.map((comment) => {
                        if (comment.id === commentId) {
                            targetComment = comment;
                            const currentVote = state.uiState.votes[commentId];
                            const pointsDiff =
                                (currentVote === "up"
                                    ? -1
                                    : currentVote === "down"
                                    ? 1
                                    : 0) +
                                (newDirection === "up"
                                    ? 1
                                    : newDirection === "down"
                                    ? -1
                                    : 0);

                            return {
                                ...comment,
                                points: comment.points + pointsDiff,
                            };
                        }
                        return comment.children
                            ? {
                                  ...comment,
                                  children: findComment(comment.children),
                              }
                            : comment;
                    });
                };

                return {
                    comments: findComment(state.comments),
                    uiState: {
                        ...state.uiState,
                        votes: {
                            ...state.uiState.votes,
                            [commentId]: newDirection,
                        },
                    },
                };
            });
        } catch (error) {
            console.error("Failed to vote:", error);
            throw error;
        }
    },
}));
