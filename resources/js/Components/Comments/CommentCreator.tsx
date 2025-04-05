import { CommentEditor } from '@/Components/Comments/CommentEditor';
import { Title, Stack } from '@mantine/core';

interface CommentCreatorProps {
	onAddComment: (content: string) => Promise<void>;
}

export const CommentCreator = ({ onAddComment }: CommentCreatorProps) => {
	return <CommentEditor onSave={onAddComment} />;
};
