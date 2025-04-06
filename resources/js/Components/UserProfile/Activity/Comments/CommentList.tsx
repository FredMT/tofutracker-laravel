import { Stack } from '@mantine/core';

import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { CommentItem } from './CommentItem';

interface CommentListProps {
	comments: Comment[];
	setReplyTarget: (target: ReplyTarget | null) => void;
	level?: number;
}

export function CommentList({
	comments,
	setReplyTarget,
	level = 0,
}: CommentListProps) {
	return (
		<Stack gap='md'>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					setReplyTarget={setReplyTarget}
				/>
			))}
		</Stack>
	);
}
