import { useState, useRef } from 'react';
import {
	Box,
	Stack,
	Title,
	Divider,
	Text,
	Button,
	Flex,
	CloseButton,
} from '@mantine/core';

import { CommentType } from '@/Components/UserProfile/Activity/Comments/commentTypes';
import styles from './CommentSection.module.css';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';

// Sample nested comment data (replace with actual data fetching)
const sampleComments: CommentType[] = [
	{
		id: '1',
		username: 'johndoe',
		avatar: '/placeholder.svg?height=40&width=40',
		content: 'This is amazing! 🔥',
		time: '2h',
		likes: 24,
		replies: [
			{
				id: '1-1',
				username: 'sarahsmith',
				avatar: '/placeholder.svg?height=40&width=40',
				content: 'I totally agree with you!',
				replyingTo: 'johndoe',
				time: '1h 50m',
				likes: 5,
				replies: [
					{
						id: '1-1-1',
						username: 'photoexpert',
						avatar: '/placeholder.svg?height=40&width=40',
						content: 'The lighting is perfect too',
						replyingTo: 'sarahsmith',
						time: '1h 45m',
						likes: 2,
					},
				],
			},
			// ... other replies ...
		],
	},
	{
		id: '2',
		username: 'sarahsmith',
		avatar: '/placeholder.svg?height=40&width=40',
		content:
			'Love the composition and lighting in this shot! What camera did you use?',
		time: '1h',
		likes: 12,
		replies: [
			{
				id: '2-1',
				username: 'creator',
				avatar: '/placeholder.svg?height=40&width=40',
				content: 'Thanks! I used a Sony A7IV with a 24-70mm lens',
				replyingTo: 'sarahsmith',
				time: '45m',
				likes: 3,
			},
		],
	},
];

interface CommentSectionProps {
	activityId: string | number; // Or whatever identifier is needed
	// Add props for initial comments if fetching outside
}

interface ReplyTarget {
	commentId: string; // ID of the top-level comment the reply belongs to
	username: string; // Username being replied to (could be comment author or another replier)
}

export function CommentSection({ activityId }: CommentSectionProps) {
	// TODO: Replace sampleComments with actual data fetching based on activityId
	const [comments, setComments] = useState<CommentType[]>(sampleComments);
	const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	const handleSetReplyTarget = (target: ReplyTarget | null) => {
		setReplyTarget(target);
		inputRef.current?.focus();
	};

	const handleCancelReply = () => {
		handleSetReplyTarget(null);
		inputRef.current?.blur();
	};

	const handlePost = () => {
		const content = inputValue.trim();
		if (!content) return;

		if (replyTarget) {
			// --- Post Reply Logic ---
			console.log(
				`Posting reply to ${replyTarget.username} on comment ${replyTarget.commentId}:`,
				content
			);
			// TODO: Implement API call to post reply
			const newReply = {
				id: Date.now().toString(),
				username: 'currentUser',
				avatar: '/placeholder.svg?height=40&width=40',
				content: content.replace(`@${replyTarget.username} `, ''), // Remove mention if desired
				replyingTo: replyTarget.username,
				time: 'Just now',
				likes: 0,
			};

			setComments((prevComments) =>
				prevComments.map((comment) => {
					if (comment.id === replyTarget.commentId) {
						return {
							...comment,
							replies: [newReply, ...(comment.replies || [])],
						};
					}
					return comment;
				})
			);
			// --- End Post Reply Logic ---
		} else {
			// --- Post Comment Logic ---
			console.log(`Posting comment for activity ${activityId}:`, content);
			// TODO: Implement API call to post comment
			const newComment: CommentType = {
				id: Date.now().toString(),
				username: 'currentUser',
				avatar: '/placeholder.svg?height=40&width=40',
				content,
				time: 'Just now',
				likes: 0,
				replies: [],
			};
			setComments([newComment, ...comments]);
			// --- End Post Comment Logic ---
		}

		handleSetReplyTarget(null); // Clear reply state and input
	};

	// TODO: Implement like/unlike logic for comments and replies

	return (
		<Box
			mt='md'
			p='md'
			className={styles.commentSectionContainer}
		>
			<Stack gap='md'>
				<Title
					order={5}
					className={styles.title}
				>
					Comments
				</Title>
				<CommentList
					comments={comments}
					setReplyTarget={handleSetReplyTarget}
				/>
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
					placeholder={replyTarget ? 'Add reply...' : 'Add a comment...'}
				/>
			</Stack>
		</Box>
	);
}
