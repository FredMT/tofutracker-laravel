import { Auth, ContentType } from "@/types";
import { useCommentStore } from "@/Components/Comments/store/commentStore";
import { notifications } from "@mantine/notifications";
import { Comment } from "@/Components/Comments/types";
import { InfoIcon } from "lucide-react";
import React from "react";

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

export const useComments = (
    type: ContentType,
    data: {
        id?: string;
        anidb_id?: string;
        map_id?: string;
    },
    auth: Auth
) => {
    const { addComment, editComment } = useCommentStore();

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

    const handleAddComment = async (
        content: string,
        parentId: string | null = null
    ) => {
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
                parentId,
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

    const handleEditComment = async (commentId: string, content: string) => {
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to edit",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }

        try {
            await editComment(commentId, content);
        } catch (error) {
            notifications.show({
                title: "Error",
                message: "Failed to edit comment",
                icon: <InfoIcon />,
                color: "red",
            });
            console.error("Failed to edit comment:", error);
        }
    };

    return {
        handleAddComment,
        handleEditComment,
    };
};
