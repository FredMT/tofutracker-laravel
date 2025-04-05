import { useState } from 'react';
import {
	Box,
	Button,
	Collapse,
	Group,
	Stack,
	Text,
	ActionIcon,
	Avatar,
} from '@mantine/core';
import {
	CommentType,
	ReplyType,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';

import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './CommentItem.module.css';
import { CommentContent } from './CommentContent';
import { ReplyItem } from './ReplyItem';

interface CommentItemProps {
	comment: CommentType;
	setReplyTarget: (target: ReplyTarget | null) => void;
}

// Helper to flatten replies (can be moved to a utils file)
function flattenReplies(replies: ReplyType[] | undefined): ReplyType[] {
	if (!replies) return [];

	const flattened: ReplyType[] = [];

	function traverse(replyList: ReplyType[]) {
		replyList.forEach((reply) => {
			flattened.push({
				...reply,
				replies: undefined, // Remove nested structure when flattening
			});
			if (reply.replies && reply.replies.length > 0) {
				traverse(reply.replies);
			}
		});
	}

	traverse(replies);

	// Sort by time (simplified - use actual date parsing/comparison)
	return flattened.sort((a, b) => a.time.localeCompare(b.time));
}

export function CommentItem({ comment, setReplyTarget }: CommentItemProps) {
	const [showReplies, setShowReplies] = useState(false);

	const flattenedReplies = flattenReplies(comment.replies);
	const hasReplies = flattenedReplies.length > 0;

	const handleReplyToComment = () => {
		setReplyTarget({
			commentId: comment.id,
			username: comment.username,
		});
	};

	const handleReplyToReply = (replyUsername: string) => {
		setReplyTarget({
			commentId: comment.id,
			username: replyUsername,
		});
	};

	return (
		<Stack
			gap='xs'
			className={styles.commentItemContainer}
		>
			<CommentContent
				username={comment.username}
				avatar={comment.avatar}
				content={comment.content}
				time={comment.time}
				likes={comment.likes}
				onReply={handleReplyToComment}
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
						: `View ${flattenedReplies.length} ${
								flattenedReplies.length === 1 ? 'reply' : 'replies'
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
						{flattenedReplies.map((reply) => (
							<ReplyItem
								key={reply.id}
								reply={reply}
								commentId={comment.id}
								setReplyTarget={setReplyTarget}
							/>
						))}
					</Stack>
				)}
			</Collapse>
		</Stack>
	);
}
