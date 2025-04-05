import { Stack } from '@mantine/core';

import {
	CommentType,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { CommentItem } from './CommentItem';

interface CommentListProps {
	comments: CommentType[];
	setReplyTarget: (target: ReplyTarget | null) => void;
}

export function CommentList({ comments, setReplyTarget }: CommentListProps) {
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
