import { Stack } from '@mantine/core';
import { ReplyTarget } from '@/Components/UserProfile/Activity/Comments/components/commentTypes';
import { CommentItem } from './CommentItem';
import { useCommentStoreContext } from '@/Components/UserProfile/Activity/Comments/context/CommentStoreContext';
import { useActivityCommentStore } from '@/Components/UserProfile/Activity/Comments/store/activityCommentsStore';

interface CommentListProps {
	setReplyTarget: (target: ReplyTarget | null) => void;
	highlightCommentId?: string | null;
}

export function CommentList({
	setReplyTarget,
	highlightCommentId,
}: CommentListProps) {
	const store = useCommentStoreContext();
	const comments = useActivityCommentStore(store, (state) => state.comments);

	return (
		<Stack
			mt='md'
			pl='md'
		>
			{comments.map((comment) => (
				<CommentItem
					key={comment.id}
					comment={comment}
					setReplyTarget={setReplyTarget}
					highlightCommentId={highlightCommentId}
				/>
			))}
		</Stack>
	);
}
