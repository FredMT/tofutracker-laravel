import { Title, Stack } from "@mantine/core";
import { CommentEditor } from "./CommentEditor";

interface CommentCreatorProps {
    onAddComment: (content: string) => Promise<void>;
}

export const CommentCreator = ({ onAddComment }: CommentCreatorProps) => {
    return (
        <Stack gap={12}>
            <Title order={3}>Comments</Title>
            <CommentEditor onSave={onAddComment} />
        </Stack>
    );
};
