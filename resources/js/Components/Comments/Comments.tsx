import { useCommentStore } from "@/stores/commentStore";
import { usePage } from "@inertiajs/react";
import { Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { InfoIcon } from "lucide-react";
import { useEffect } from "react";
import { CommentEditor } from "./CommentEditor";
import { CommentThread } from "./CommentThread";
import { Auth } from "@/types";
import { Comment } from "./types";
import { ContentType } from "@/types";

interface Props {
    comments: Comment[];
    type: ContentType;
    data: {
        id?: string;
        anidb_id?: string;
        map_id?: string;
    };
    auth: Auth;
    [key: string]: any;
}

export default function Comments() {
    const { comments, type, data, auth } = usePage<Props>().props;
    const {
        comments: storeComments,
        addComment,
        setInitialComments,
    } = useCommentStore();

    useEffect(() => {
        setInitialComments(comments);
    }, [comments]);

    const getContentId = () => {
        switch (type) {
            case "animemovie":
                return data.anidb_id;
            case "animetv":
                return data.map_id;
            default:
                return data.id;
        }
    };

    const handleAddComment = async (content: string) => {
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to comment",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }

        try {
            const contentId = getContentId();
            if (!contentId) {
                throw new Error("Content ID not found");
            }
            await addComment(
                type,
                contentId,
                content,
                null,
                auth.user.username
            );
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
