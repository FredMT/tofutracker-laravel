import dayjs from 'dayjs';
import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { Stack } from '@mantine/core';

import { CommentContent } from './CommentContent';
import styles from './CommentItem.module.css';

interface CommentItemProps {
	comment: Comment;
	setReplyTarget: (target: ReplyTarget | null) => void;
	onEditRequest: (commentId: string, newContent: string) => void;
	onDeleteRequest: (commentId: string) => void;
}

// Helper function to flatten replies
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
	onEditRequest,
	onDeleteRequest,
}: CommentItemProps) {
	// Flatten and sort replies
	const allReplies = flattenReplies(comment).sort((a, b) =>
		dayjs(a.created_at).diff(dayjs(b.created_at))
	);
	const hasReplies = allReplies.length > 0;

	// Always target the top-level comment for replies
	const handleReplyClick = (replyComment?: Comment) => {
		setReplyTarget({
			commentId: comment.id, // Target the parent comment ID
			username: replyComment
				? replyComment.author ?? '[removed]'
				: comment.author ?? '[removed]',
		});
	};

	return (
		<Stack
			gap='xs'
			className={styles.commentItemContainer}
		>
			<CommentContent
				comment={comment}
				onReply={() => handleReplyClick()} // Pass parent comment info
				onEditRequest={onEditRequest}
				onDeleteRequest={onDeleteRequest}
			/>

			{hasReplies && (
				<Stack
					gap='sm'
					mt='xs'
					ml={30}
					className={styles.repliesContainer}
				>
					{allReplies.map((reply) => (
						<CommentContent
							key={reply.id}
							comment={reply}
							// Pass the specific reply info for context, but target parent
							onReply={() => handleReplyClick(reply)}
							onEditRequest={onEditRequest}
							onDeleteRequest={onDeleteRequest}
						/>
					))}
				</Stack>
			)}
		</Stack>
	);
}
