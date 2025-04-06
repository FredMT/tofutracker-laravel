import { useMemo, useState } from 'react';
import { Box, Button, Collapse, Stack } from '@mantine/core';
import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';

import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CommentItem.module.css';
import { CommentContent } from './CommentContent';

interface CommentItemProps {
	comment: Comment;
	setReplyTarget: (target: ReplyTarget | null) => void;
}

function getAllDescendants(comments: Comment[]): Comment[] {
	const descendants: Comment[] = [];
	const queue = [...comments];

	while (queue.length > 0) {
		const current = queue.shift();
		if (current) {
			descendants.push(current);
			if (current.children && current.children.length > 0) {
				queue.push(...current.children);
			}
		}
	}
	return descendants;
}

export function CommentItem({ comment, setReplyTarget }: CommentItemProps) {
	const [showReplies, setShowReplies] = useState(false);

	const allReplies = useMemo(() => {
		const replies = getAllDescendants(comment.children || []);
		return replies.sort((a, b) => a.created_at - b.created_at);
	}, [comment.children]);
	const hasReplies = allReplies.length > 0;

	const handleReplyToParent = () => {
		const targetUsername = comment.author ?? 'anonymous';
		setReplyTarget({
			commentId: comment.id,
			username: targetUsername,
		});
	};

	const handleReplyToReply = (replyAuthor: string | null) => {
		setReplyTarget({
			commentId: comment.id,
			username: replyAuthor ?? 'anonymous',
		});
	};

	return (
		<Stack
			gap='xs'
			className={styles.commentItemContainer}
		>
			<CommentContent
				comment={comment}
				onReply={handleReplyToParent}
			/>

			{hasReplies && (
				<Button
					variant='subtle'
					size='xs'
					onClick={() => setShowReplies(!showReplies)}
					leftSection={
						showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />
					}
					ml={50}
					className={styles.viewRepliesButton}
				>
					{showReplies
						? 'Hide replies'
						: `View ${allReplies.length} ${
								allReplies.length === 1 ? 'reply' : 'replies'
						  }`}
				</Button>
			)}

			<Collapse
				in={showReplies}
				transitionDuration={200}
			>
				{hasReplies && (
					<Stack
						gap='sm'
						mt='xs'
						ml={20}
						className={styles.repliesContainer}
					>
						{allReplies.map((reply) => (
							<CommentContent
								key={reply.id}
								comment={reply}
								onReply={() => handleReplyToReply(reply.author)}
							/>
						))}
					</Stack>
				)}
			</Collapse>
		</Stack>
	);
}
