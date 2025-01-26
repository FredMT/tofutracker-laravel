import { useCommentStore } from "@/stores/commentStore";
import { CommentEditor } from "./CommentEditor";
import { CommentThread } from "./CommentThread";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { Comment } from "./types";
import { Text, Stack, Title, Divider } from "@mantine/core";

export default function Comments() {
    const { comments } = usePage<{ comments: Comment[] }>().props;
    const {
        comments: storeComments,
        addComment,
        addReply,
        editComment,
        setInitialComments,
    } = useCommentStore();

    useEffect(() => {
        setInitialComments(comments);
    }, [comments]);

    return (
        <>
            <Divider my="md" />
            <Stack gap={12}>
                <Title order={3}>Comments</Title>
                <CommentEditor onSave={addComment} />
                {storeComments.length === 0 ? (
                    <Stack align="center" py="md">
                        <Text size="lg" c="dimmed" ta="center">
                            No comments yet
                        </Text>
                        <Text size="sm" c="dimmed" ta="center">
                            Be the first to start a discussion!
                        </Text>
                    </Stack>
                ) : (
                    storeComments.map((comment) => (
                        <CommentThread
                            key={comment.id}
                            {...comment}
                            onReply={addReply}
                            onEdit={editComment}
                        />
                    ))
                )}
            </Stack>
        </>
    );
}
