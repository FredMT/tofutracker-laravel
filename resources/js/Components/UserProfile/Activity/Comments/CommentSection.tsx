import { useRef, useState } from 'react';
import {
	Box,
	CloseButton,
	Divider,
	Flex,
	Stack,
	Text,
	Title,
} from '@mantine/core';

import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import styles from './CommentSection.module.css';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';
import { useAuth } from '@/propsHooks/useAuth';

interface CommentSectionProps {
	activityId: string | number; // Or whatever identifier is needed
	initialComments?: Comment[]; // Add optional prop for initial comments
}

export function CommentSection({
	activityId,
	initialComments = [],
}: CommentSectionProps) {
	// Initialize state with initialComments prop, default to empty array
	const [comments, setComments] = useState<Comment[]>(initialComments);
	const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const auth = useAuth();

	const handleSetReplyTarget = (target: ReplyTarget | null) => {
		setReplyTarget(target);
		if (target) {
			// Set input value for replying, and focus
			setInputValue(`@${target.username} `);
			inputRef.current?.focus();
		} else {
			setInputValue(''); // Clear input on cancel
			inputRef.current?.blur();
		}
	};

	const handleCancelReply = () => {
		handleSetReplyTarget(null);
	};

	// Recursive function helper to find and update/delete comment
	const updateCommentRecursively = (
		commentList: Comment[],
		commentId: string,
		action: (comment: Comment) => Comment | null // Return null to delete
	): Comment[] => {
		return commentList
			.map((comment) => {
				if (comment.id === commentId) {
					return action(comment);
				}
				if (comment.children) {
					const updatedChildren = updateCommentRecursively(
						comment.children,
						commentId,
						action
					);
					// Check if the children array reference has changed. If it has,
					// it means an update occurred within the children, so we must
					// return a new parent comment object with the updated children.
					if (updatedChildren !== comment.children) {
						return { ...comment, children: updatedChildren };
					}
				}
				// Return the original comment reference if it wasn't the target
				// and its children array reference hasn't changed.
				return comment;
			})
			.filter((comment): comment is Comment => comment !== null); // Remove nulls (deleted comments)
	};

	const handleEdit = (commentId: string, newContent: string) => {
		console.log(`Editing comment ${commentId}:`, newContent);
		// TODO: Implement API call to edit comment
		setComments((prevComments) =>
			updateCommentRecursively(prevComments, commentId, (comment) => ({
				...comment,
				content: newContent,
				updated_at: Math.floor(Date.now() / 1000), // Update timestamp (seconds)
			}))
		);
	};

	const handleDelete = (commentId: string) => {
		console.log(`Deleting comment ${commentId}`);
		// TODO: Implement API call to delete comment

		// Optimistic update: Soft delete
		setComments((prevComments) =>
			updateCommentRecursively(prevComments, commentId, (comment) => ({
				...comment,
				author: null, // Anonymize
				avatar: null, // Remove avatar
				content: '[removed]', // Set content to removed placeholder
				deleted_at: Math.floor(Date.now() / 1000), // Mark as deleted now (seconds)
				// Keep children/replies intact
			}))
		);

		// Option 2: Hard delete (filter out from list) - Commented out
		/*
		setComments((prevComments) =>
			updateCommentRecursively(prevComments, commentId, () => null)
		);
		*/
	};

	const handlePost = () => {
		if (!auth.user) return; // Guard: Do nothing if not logged in

		const content = inputValue.trim();
		if (!content) return;

		const authorUsername = auth.user.username;
		const authorAvatar = auth.user.avatar
			? `/storage/${auth.user.avatar}`
			: `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${authorUsername}`;

		if (replyTarget) {
			// --- Post Reply Logic ---
			console.log(
				`Posting reply to ${replyTarget.username} on comment ${replyTarget.commentId}:`,
				content
			);
			// TODO: Implement API call to post reply
			const newReply: Comment = {
				id: Date.now().toString(),
				author: authorUsername,
				avatar: authorAvatar, // Use consistent avatar
				content: content.replace(`@${replyTarget.username} `, ''),
				replyingTo: replyTarget.username,
				points: 0,
				created_at: Math.floor((Date.now() - 2000) / 1000),
				updated_at: Math.floor((Date.now() - 2000) / 1000),
				deleted_at: null,
				direction: 0,
			};

			const addReplyRecursively = (
				commentList: Comment[],
				parentId: string,
				reply: Comment
			): Comment[] => {
				return commentList.map((comment) => {
					if (comment.id === parentId) {
						return {
							...comment,
							children: [reply, ...(comment.children || [])],
						};
					}
					if (comment.children) {
						return {
							...comment,
							children: addReplyRecursively(comment.children, parentId, reply),
						};
					}
					return comment;
				});
			};

			setComments((prevComments) =>
				addReplyRecursively(prevComments, replyTarget.commentId, newReply)
			);
			// --- End Post Reply Logic ---
		} else {
			// --- Post Comment Logic ---
			console.log(`Posting comment for activity ${activityId}:`, content);
			// TODO: Implement API call to post comment
			const newComment: Comment = {
				id: Date.now().toString(),
				author: authorUsername,
				avatar: authorAvatar, // Use consistent avatar
				content,
				created_at: Math.floor((Date.now() - 2000) / 1000),
				updated_at: Math.floor((Date.now() - 2000) / 1000),
				deleted_at: null,
				points: 0,
				children: [],
				direction: 0,
			};
			setComments([newComment, ...comments]);
			// --- End Post Comment Logic ---
		}

		setInputValue('');
		handleSetReplyTarget(null);
	};

	// TODO: Implement like/unlike logic for comments and replies

	return (
		<Box
			mt='md'
			className={styles.commentSectionContainer}
		>
			<Stack gap={0}>
				<Title
					order={3}
					className={styles.title}
					pl='md'
				>
					Comments
				</Title>

				{comments.length > 0 ? (
					<CommentList
						comments={comments}
						setReplyTarget={handleSetReplyTarget}
						onEditRequest={handleEdit}
						onDeleteRequest={handleDelete}
					/>
				) : (
					<Text
						size='sm'
						c='dimmed'
						ta='center'
						pb='md'
					>
						No comments yet. Be the first!
					</Text>
				)}

				<Divider my='xs' />

				{/* Reply Indicator */}
				{replyTarget && (
					<Flex
						justify='space-between'
						align='center'
						px={5}
						className={styles.replyingToBanner}
					>
						<Text
							size='xs'
							c='dimmed'
						>
							Replying to @{replyTarget.username}
						</Text>
						<CloseButton
							size='sm'
							onClick={handleCancelReply}
							aria-label='Cancel reply'
						/>
					</Flex>
				)}
				<CommentInput
					ref={inputRef}
					value={inputValue}
					onValueChange={setInputValue}
					onPost={handlePost}
					placeholder={
						!auth.user
							? 'Log in to comment...'
							: replyTarget
							? `Reply to @${replyTarget.username}...`
							: 'Add a comment...'
					}
					disabled={!auth.user}
				/>
			</Stack>
		</Box>
	);
}
