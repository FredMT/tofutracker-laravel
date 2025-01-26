import { useCommentStore } from "@/stores/commentStore";
import { CommentEditor } from "./CommentEditor";
import { CommentThread } from "./CommentThread";
import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { Comment } from "./types";
import { Text, Stack, Title, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { InfoIcon } from "lucide-react";

interface Props {
    comments: Comment[];
    type: "movie" | "tv" | "user";
    data: {
        id: string;
    };
    [key: string]: any;
}

export default function Comments() {
    const { comments, type, data } = usePage<Props>().props;
    const {
        comments: storeComments,
        addComment,
        setInitialComments,
    } = useCommentStore();

    useEffect(() => {
        setInitialComments(comments);
    }, [comments]);

    const handleAddComment = async (content: string) => {
        try {
            await addComment(type, data.id, content, null);
        } catch (error) {
            notifications.show({
                title: "Error",
                message: "Failed to add comment",
                icon: <InfoIcon />,
                color: "red",
            });
            console.error("Failed to add comment:", error);
        }
    };

    return (
        <>
            <Stack gap={12}>
                <Title order={3}>Comments</Title>
                <CommentEditor onSave={handleAddComment} />
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
                        <CommentThread key={comment.id} {...comment} />
                    ))
                )}
            </Stack>
        </>
    );
}
