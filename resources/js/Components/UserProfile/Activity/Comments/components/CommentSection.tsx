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
import { ReplyTarget } from '@/Components/UserProfile/Activity/Comments/components/commentTypes';
import styles from './CommentSection.module.css';
import { CommentList } from './CommentList';
import { CommentInput } from './CommentInput';
import { useAuth } from '@/propsHooks/useAuth';
import { CommentStoreProvider } from '@/Components/UserProfile/Activity/Comments/context/CommentStoreContext';
import {
	createCommentStore,
	useActivityCommentStore,
} from '@/Components/UserProfile/Activity/Comments/store/activityCommentsStore';
import { Comment } from '@/Components/UserProfile/Activity/Comments/components/commentTypes';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { X } from 'lucide-react';
import { useSearchParams } from '@/hooks/useSearchParams';

interface CommentSectionProps {
	activityId: number;
	initialComments: Comment[] | [];
}

export function CommentSection({
	activityId,
	initialComments = [],
}: CommentSectionProps) {
	// Keep local state for reply target and input value
	const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
	const [inputValue, setInputValue] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const auth = useAuth();
	const { getParam } = useSearchParams();
	const showCommentId = getParam('showCommentId');

	// Create the store instance only once
	const storeRef = useRef<ReturnType<typeof createCommentStore>>();
	if (!storeRef.current) {
		storeRef.current = createCommentStore(initialComments);
	}
	const store = storeRef.current;

	// Get comments directly from the store for rendering
	const comments = useActivityCommentStore(store, (state) => state.comments);
	const addComment = useActivityCommentStore(
		store,
		(state) => state.addComment
	);
	const addReply = useActivityCommentStore(store, (state) => state.addReply);

	const handleSetReplyTarget = (target: ReplyTarget | null) => {
		setReplyTarget(target);
		if (target) {
			setInputValue(`@${target.username} `);
			inputRef.current?.focus();
		} else {
			setInputValue('');
			inputRef.current?.blur();
		}
	};

	const handleCancelReply = () => {
		handleSetReplyTarget(null);
	};

	async function handlePost() {
		if (!auth.user) return;

		const content = inputValue.trim();
		if (!content) return;

		const authorUsername = auth.user.username;
		const authorAvatar = auth.user.avatar
			? `${auth.user.avatar}`
			: `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${authorUsername}`;

		const baseNewComment: Omit<Comment, 'id' | 'replyingTo' | 'children'> = {
			author: authorUsername,
			avatar: authorAvatar,
			content: content,
			points: 0,
			created_at: Math.floor(Date.now() / 1000),
			updated_at: Math.floor(Date.now() / 1000),
			deleted_at: null,
			direction: 0,
		};

		if (replyTarget) {
			try {
				const response = await axios.post(
					route('comments.store', { type: 'useractivity', id: activityId }),
					{
						body: content.startsWith(`@${replyTarget.username}`)
							? content.replace(`@${replyTarget.username} `, '')
							: content,
						parent_id: replyTarget.commentId,
					}
				);

				const newReply: Comment = {
					...baseNewComment,
					id: response.data.comment.id,
					content: content.replace(`@${replyTarget.username} `, ''),
					replyingTo: replyTarget.username,
				};

				addReply(replyTarget.commentId, newReply);
			} catch (error: any) {
				notifications.show({
					title: 'Error',
					message:
						'Sorry, we were unable to make your reply. Please try again later',
					color: 'red',
					icon: <X />,
				});
			}
		} else {
			try {
				const response = await axios.post(
					route('comments.store', { type: 'useractivity', id: activityId }),
					{ body: content }
				);

				const newComment: Comment = {
					...baseNewComment,
					id: response.data.comment.id,
					children: [],
				};

				addComment(newComment);
			} catch (error: any) {
				notifications.show({
					title: 'Error',
					message:
						'Sorry, we were unable to make your comment. Please try again later',
					color: 'red',
					icon: <X />,
				});
			}
		}

		setInputValue('');
		handleSetReplyTarget(null);
	}

	return (
		<CommentStoreProvider store={store}>
			<Box
				mt='md'
				className={styles.commentSectionContainer}
			>
				<Stack gap={0}>
					<Title
						order={4}
						className={styles.title}
						pl='md'
					>
						Comments
					</Title>

					{comments.length > 0 ? (
						<CommentList
							setReplyTarget={handleSetReplyTarget}
							highlightCommentId={showCommentId}
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
							replyTarget
								? `Replying to @${replyTarget.username}...`
								: 'Add a comment...'
						}
						isLoggedIn={!!auth.user}
					/>
				</Stack>
			</Box>
		</CommentStoreProvider>
	);
}
