import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/components/commentTypes';
import { Stack } from '@mantine/core';
import dayjs from 'dayjs';

import { useCommentStoreContext } from '@/Components/UserProfile/Activity/Comments/context/CommentStoreContext';
import { useActivityCommentStore } from '@/Components/UserProfile/Activity/Comments/store/activityCommentsStore';
import { useScrollIntoView } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { CommentContent } from './CommentContent';
import styles from './CommentItem.module.css';

interface CommentItemProps {
	comment: Comment;
	setReplyTarget: (target: ReplyTarget | null) => void;
	highlightCommentId?: string | null;
}

const flattenReplies = (comment: Comment): Comment[] => {
	let replies: Comment[] = [];
	if (comment.children) {
		for (const child of comment.children) {
			replies.push(child);
			replies = replies.concat(flattenReplies(child));
		}
	}
	return replies;
};

export function CommentItem({
	comment,
	setReplyTarget,
	highlightCommentId,
}: CommentItemProps) {
	const store = useCommentStoreContext();
	const updateComment = useActivityCommentStore(
		store,
		(state) => state.updateComment
	);

	const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
		offset: 60,
		duration: 700,
	});

	const allReplies = flattenReplies(comment).sort((a, b) =>
		dayjs(a.created_at).diff(dayjs(b.created_at))
	);
	const hasReplies = allReplies.length > 0;

	const handleReplyClick = (replyComment?: Comment) => {
		setReplyTarget({
			commentId: comment.id,
			username: replyComment
				? replyComment.author ?? '[removed]'
				: comment.author ?? '[removed]',
		});
	};

	const handleEditRequest = async (commentId: string, newContent: string) => {
		try {
			await axios.patch(
				route('comments.update', {
					comment: commentId,
				}),
				{
					body: newContent,
				}
			);

			updateComment(commentId, {
				content: newContent,
				updated_at: Math.floor(Date.now() / 1000),
			});
		} catch (error: any) {
			notifications.show({
				title: 'Error',
				message:
					'Sorry, we were unable to edit your comment. Please try again later',
				color: 'red',
				icon: <X />,
			});
		}
	};

	const handleDeleteRequest = async (commentId: string) => {
		try {
			await axios.delete(
				route('comments.destroy', {
					comment: commentId,
				})
			);
			updateComment(commentId, {
				author: null,
				avatar: null,
				content: '[removed]',
				deleted_at: Math.floor(Date.now() / 1000),
			});
		} catch (error: any) {
			console.log(error);
			notifications.show({
				title: 'Error',
				message:
					'Sorry, we were unable to delete your comment. Please try again later',
				color: 'red',
				icon: <X />,
			});
		}
	};

	// Scroll to highlighted comment
	useEffect(() => {
		const shouldHighlight =
			(highlightCommentId && comment.id === highlightCommentId) || 
			(highlightCommentId &&
				allReplies.some((reply) => reply.id === highlightCommentId)); 

		if (shouldHighlight && targetRef.current) {
			const timer = setTimeout(() => {
				scrollIntoView({ alignment: 'center' });
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [highlightCommentId, comment.id, allReplies, scrollIntoView]);

	return (
		<Stack
			gap='sm'
			className={styles.commentItemContainer}
			ref={
				(highlightCommentId && comment.id === highlightCommentId) ||
				(highlightCommentId &&
					allReplies.some((reply) => reply.id === highlightCommentId))
					? targetRef
					: undefined
			}
		>
			<CommentContent
				comment={comment}
				onReply={() => handleReplyClick()}
				onEditRequest={handleEditRequest}
				onDeleteRequest={handleDeleteRequest}
				isHighlighted={
					highlightCommentId === comment.id ||
					allReplies.some((reply) => reply.id === highlightCommentId)
				}
			/>

			{hasReplies && (
				<Stack
					gap='sm'
					ml={30}
					mb='md'
					className={styles.repliesContainer}
				>
					{allReplies.map((reply) => (
						<CommentContent
							key={reply.id}
							comment={reply}
							onReply={() => handleReplyClick(reply)}
							onEditRequest={handleEditRequest}
							onDeleteRequest={handleDeleteRequest}
							isHighlighted={highlightCommentId === reply.id}
						/>
					))}
				</Stack>
			)}
		</Stack>
	);
}
