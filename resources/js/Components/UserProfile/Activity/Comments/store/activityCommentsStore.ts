import { createStore, useStore } from 'zustand';
import { Comment } from '@/Components/UserProfile/Activity/Comments/components/commentTypes';

interface CommentState {
	comments: Comment[];
}

interface CommentActions {
	addComment: (comment: Comment) => void;
	updateComment: (commentId: string, updates: Partial<Comment>) => void;
	addReply: (parentId: string, reply: Comment) => void;
}

export type CommentStore = ReturnType<typeof createCommentStore>;

export const createCommentStore = (initialComments: Comment[] = []) => {
	return createStore<CommentState & CommentActions>((set) => ({
		comments: initialComments,

		addComment: (comment) =>
			set((state) => ({
				// Prepend new top-level comment (simple array copy)
				comments: [comment, ...state.comments],
			})),

		updateComment: (commentId, updates) =>
			set((state) => {
				// Recursive function to update a comment within the tree
				const updateCommentInTree = (comments: Comment[]): Comment[] => {
					return comments.map((comment) => {
						if (comment.id === commentId) {
							return { ...comment, ...updates };
						}
						if (comment.children && comment.children.length > 0) {
							const updatedChildren = updateCommentInTree(comment.children);
							if (updatedChildren !== comment.children) {
								return { ...comment, children: updatedChildren };
							}
						}
						return comment;
					});
				};

				return {
					comments: updateCommentInTree(state.comments),
				};
			}),

		addReply: (parentId, reply) =>
			set((state) => {
				// Recursive function to add a reply within the tree
				const addReplyToTree = (comments: Comment[]): Comment[] => {
					return comments.map((comment) => {
						if (comment.id === parentId) {
							return {
								...comment,
								children: [reply, ...(comment.children || [])],
							};
						}
						if (comment.children && comment.children.length > 0) {
							const updatedChildren = addReplyToTree(comment.children);
							if (updatedChildren !== comment.children) {
								return { ...comment, children: updatedChildren };
							}
						}
						return comment;
					});
				};

				return {
					comments: addReplyToTree(state.comments),
				};
			}),
	}));
};

export const useActivityCommentStore = <T>(
	store: CommentStore,
	selector: (state: CommentState & CommentActions) => T
): T => {
	return useStore(store, selector);
};
