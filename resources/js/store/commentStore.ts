import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from 'axios';
import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { produce } from 'immer';
import dayjs from 'dayjs';

// Helper function to recursively find and update/delete a comment
const findAndUpdateComment = (
	comments: Comment[],
	commentId: string,
	updateFn: (comment: Comment) => Comment | null // Return null to delete
): Comment[] => {
	return produce(comments, (draft) => {
		const findRecursively = (
			items: Comment[],
			parentId: string | null = null
		): boolean => {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.id === commentId) {
					const updatedItem = updateFn(item);
					if (updatedItem === null) {
						items.splice(i, 1); // Delete the comment
					} else {
						items[i] = updatedItem; // Update the comment
					}
					return true; // Found and handled
				}
				if (item.children && findRecursively(item.children, item.id)) {
					return true; // Found and handled in children
				}
			}
			return false; // Not found in this branch
		};
		findRecursively(draft);
	});
};

// Helper to add a reply
const addReply = (
	comments: Comment[],
	parentId: string,
	reply: Comment
): Comment[] => {
	return produce(comments, (draft) => {
		const findParentAndAdd = (items: Comment[]): boolean => {
			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				if (item.id === parentId) {
					if (!item.children) {
						item.children = [];
					}
					// Add reply sorted by date
					item.children.push(reply);
					item.children.sort((a, b) =>
						dayjs(a.created_at).diff(dayjs(b.created_at))
					);
					return true;
				}
				if (item.children && findParentAndAdd(item.children)) {
					return true;
				}
			}
			return false;
		};
		findParentAndAdd(draft);
	});
};

interface CommentState {
	comments: Comment[];
	commentCount: number;
	isLoading: boolean;
	fetchError: string | null;
	postError: string | null;
	replyTarget: ReplyTarget | null;
	activityId: string | null; // To know which activity's comments are loaded
}

interface CommentActions {
	setActivityId: (activityId: string) => void;
	fetchComments: () => Promise<void>;
	addComment: (
		content: string,
		parentId?: string,
		replyingTo?: string
	) => Promise<boolean>; // Returns success status
	updateComment: (commentId: string, newContent: string) => Promise<boolean>;
	deleteComment: (commentId: string) => Promise<boolean>;
	toggleLike: (commentId: string) => Promise<boolean>;
	setReplyTarget: (target: ReplyTarget | null) => void;
}

const initialState: CommentState = {
	comments: [],
	commentCount: 0,
	isLoading: false,
	fetchError: null,
	postError: null,
	replyTarget: null,
	activityId: null,
};

export const useCommentStore = create<CommentState & CommentActions>()(
	devtools(
		(set, get) => ({
			...initialState,

			setActivityId: (activityId) =>
				set({
					activityId,
					comments: [],
					commentCount: 0,
					fetchError: null,
					postError: null,
					replyTarget: null,
					isLoading: false,
				}),

			fetchComments: async () => {
				const { activityId, isLoading } = get();
				if (!activityId || isLoading) return;

				set({ isLoading: true, fetchError: null });
				try {
					const response = await axios.get<{
						comments: Comment[];
						commentCount: number;
					}>(
						route('activities.comments.index', {
							activity: activityId,
						})
					);
					set({
						comments: response.data.comments,
						commentCount: response.data.commentCount,
						isLoading: false,
					});
				} catch (error) {
					console.error('Failed to fetch comments:', error);
					set({
						fetchError: 'Failed to load comments. Please try again later.',
						isLoading: false,
					});
				}
			},

			addComment: async (content, parentId, replyingTo) => {
				const { activityId } = get();
				if (!activityId) return false;

				set({ postError: null });
				try {
					const response = await axios.post<{
						comment: Comment;
						commentCount: number;
					}>(
						route('activities.comments.store', {
							activity: activityId,
						}),
						{
							content,
							parent_id: parentId,
							replying_to: replyingTo,
						}
					);

					const newComment = response.data.comment;
					set(
						produce((state: CommentState) => {
							if (parentId) {
								state.comments = addReply(state.comments, parentId, newComment);
							} else {
								// Add top-level comment sorted by date
								state.comments.push(newComment);
								state.comments.sort((a, b) =>
									dayjs(a.created_at).diff(dayjs(b.created_at))
								);
							}
							state.commentCount = response.data.commentCount;
							state.replyTarget = null; // Clear reply target on successful post
						})
					);
					return true;
				} catch (error) {
					console.error('Failed to add comment:', error);
					set({
						postError:
							'Failed to post comment. Please check your input and try again.',
					});
					return false;
				}
			},

			updateComment: async (commentId, newContent) => {
				// Optimistic update
				const previousComments = get().comments;
				const updatedComments = findAndUpdateComment(
					previousComments,
					commentId,
					(comment) => ({
						...comment,
						content: newContent,
						updated_at: dayjs().unix(),
					})
				);
				set({ comments: updatedComments, postError: null });

				try {
					await axios.patch(route('comments.update', { comment: commentId }), {
						content: newContent,
					});
					// Success - state already updated optimistically
					return true;
				} catch (error) {
					console.error('Failed to update comment:', error);
					// Rollback on error
					set({
						comments: previousComments,
						postError: 'Failed to update comment.',
					});
					return false;
				}
			},

			deleteComment: async (commentId) => {
				// Optimistic update (soft delete)
				const previousComments = get().comments;
				const updatedComments = findAndUpdateComment(
					previousComments,
					commentId,
					(comment) => ({
						...comment,
						content: '[removed]',
						author: null,
						avatar: null,
						deleted_at: dayjs().unix(),
						// Keep points, children, etc.
					})
				);
				set({ comments: updatedComments, postError: null });

				try {
					await axios.delete(route('comments.destroy', { comment: commentId }));
					// Success - state already updated optimistically
					return true;
				} catch (error) {
					console.error('Failed to delete comment:', error);
					// Rollback on error
					set({
						comments: previousComments,
						postError: 'Failed to delete comment.',
					});
					return false;
				}
			},

			toggleLike: async (commentId) => {
				// Optimistic update
				const previousComments = get().comments;
				let previousDirection = 0;
				const updatedComments = findAndUpdateComment(
					previousComments,
					commentId,
					(comment) => {
						previousDirection = comment.direction ?? 0;
						const newDirection = previousDirection === 1 ? 0 : 1;
						const pointChange = newDirection === 1 ? 1 : -1;
						const currentPoints = comment.points ?? 0;
						return {
							...comment,
							direction: newDirection,
							points: currentPoints + pointChange,
						};
					}
				);
				set({ comments: updatedComments, postError: null });

				try {
					// Determine endpoint based on whether we are liking or unliking
					const endpoint =
						previousDirection === 1 ? 'comments.unlike' : 'comments.like';
					await axios.post(route(endpoint, { comment: commentId }));
					// Success - state already updated optimistically
					return true;
				} catch (error) {
					console.error('Failed to toggle like:', error);
					// Rollback on error
					set({
						comments: previousComments,
						postError: 'Failed to update like status.',
					});
					return false;
				}
			},

			setReplyTarget: (target) => set({ replyTarget: target }),
		}),
		{
			name: 'comment-storage',
		}
	)
);
