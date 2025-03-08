import { useCommentStore } from "@/Components/Comments/store/commentStore";
import { usePage } from "@inertiajs/react";
import { Stack } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import CommentThread from "@/Components/Comments/CommentThread";
import { EmptyState } from "@/Components/Comments/EmptyState";
import { CommentCreator } from "@/Components/Comments/CommentCreator";
import { useComments } from "@/Components/Comments/hooks/useComments";
import { CommentsProps, Comment } from "@/Components/Comments/types";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useCommentsQuery } from "@/Components/Comments/hooks/useCommentsQuery";
import { ViewAllCommentsButton } from "@/Components/Comments/ViewAllCommentsButton";

export default function Comments() {
    const {
        comments: initialComments,
        type,
        data,
        auth,
    } = usePage<CommentsProps>().props;
    const { comments: storeComments, setInitialComments } = useCommentStore();
    const { handleAddComment, handleEditComment } = useComments(
        type,
        data,
        auth
    );
    const { getParam } = useSearchParams();
    const parentId = getParam("parentId");
    const showCommentId = getParam("showCommentId");
    const commentRef = useRef<HTMLDivElement>(null);
    const [isViewingThread, setIsViewingThread] = useState(
        Boolean(parentId || showCommentId)
    );
    const mounted = useMounted();

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

    const contentId = getContentId() || "";

    const { commentsQuery, fetchAllComments } = useCommentsQuery(
        type,
        contentId,
        parentId || (showCommentId && !parentId ? showCommentId : null),
        showCommentId
    );

    const isLoading = commentsQuery.isLoading;

    const handleViewAllComments = async () => {
        try {
            const allCommentsData = await fetchAllComments();
            if (allCommentsData?.comments) {
                setInitialComments(allCommentsData.comments);
                setIsViewingThread(false);

                if (mounted) {
                    const url = new URL(window.location.href);
                    url.searchParams.delete("parentId");
                    url.searchParams.delete("showCommentId");
                    window.history.pushState({}, "", url.toString());
                }
            }
        } catch (error) {
            console.error("Failed to fetch all comments:", error);
        }
    };

    useEffect(() => {
        // Initialize comments from query or initial data
        if (commentsQuery.data?.comments) {
            setInitialComments(commentsQuery.data.comments);
        } else if (initialComments) {
            // Extract comments array from the initial response
            const commentsArray = Array.isArray(initialComments)
                ? initialComments
                : (initialComments as any).comments || [];

            setInitialComments(commentsArray);
        }
    }, [commentsQuery.data, initialComments]);

    return (
        <Stack gap={12} ref={commentRef}>
            {isViewingThread && (
                <ViewAllCommentsButton
                    onClick={handleViewAllComments}
                    isLoading={isLoading}
                />
            )}

            <CommentCreator onAddComment={handleAddComment} />

            {isLoading ? (
                <div className="py-8 text-center">Loading comments...</div>
            ) : storeComments.length === 0 ? (
                <EmptyState />
            ) : (
                storeComments.map((comment) => (
                    <CommentThread
                        key={comment.id}
                        {...comment}
                        isHighlighted={comment.id === showCommentId}
                    />
                ))
            )}
        </Stack>
    );
}
