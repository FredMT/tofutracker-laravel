import { useCommentStore } from "@/Components/Comments/store/commentStore";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import { useEffect } from "react";
import { CommentThread } from "./CommentThread";
import { EmptyState } from "./EmptyState";
import { CommentCreator } from "./CommentCreator";
import { useComments } from "./hooks/useComments";
import { CommentsProps } from "./types";

export default function Comments() {
    const { comments, type, data, auth } = usePage<CommentsProps>().props;
    const { comments: storeComments, setInitialComments } = useCommentStore();
    const { handleAddComment } = useComments(type, data, auth);

    useEffect(() => {
        setInitialComments(comments);
    }, [comments]);

    return (
        <Stack gap={12}>
            <CommentCreator onAddComment={handleAddComment} />
            {storeComments.length === 0 ? (
                <EmptyState />
            ) : (
                storeComments.map((comment) => (
                    <CommentThread key={comment.id} {...comment} />
                ))
            )}
        </Stack>
    );
}
