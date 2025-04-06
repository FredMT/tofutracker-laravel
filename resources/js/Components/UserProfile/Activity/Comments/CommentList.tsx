import { Stack } from '@mantine/core';

import {
	Comment,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { CommentItem } from './CommentItem';

interface CommentListProps {
	comments: Comment[];
	setReplyTarget: (target: ReplyTarget | null) => void;
	onEditRequest: (commentId: string, newContent: string) => void;
	onDeleteRequest: (commentId: string) => void;
}

export function CommentList({
	comments,
	setReplyTarget,
	onEditRequest,
	onDeleteRequest,
}: CommentListProps) {
	return (
		<Stack
			gap={0}
			mt='md'
			pl='md'
		>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					setReplyTarget={setReplyTarget}
					onEditRequest={onEditRequest}
					onDeleteRequest={onDeleteRequest}
				/>
			))}
		</Stack>
	);
}
