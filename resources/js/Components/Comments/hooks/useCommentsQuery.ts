import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Comment } from "@/Components/Comments/types";
import { Auth, ContentType } from "@/types";

interface CommentsResponse {
    comments: Comment[];
    showCommentId: string | null;
}

export function useCommentsQuery(
    type: ContentType,
    contentId: string,
    parentId?: string | null,
    showCommentId?: string | null
) {
    const queryClient = useQueryClient();

    // Define query key based on parameters
    const queryKey = ["comments", type, contentId, parentId, showCommentId];

    // Fetch comments query
    const commentsQuery = useQuery({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams();
            if (parentId) params.append("parentId", parentId);
            if (showCommentId) params.append("showCommentId", showCommentId);

            const response = await axios.get<CommentsResponse>(
                `/${type}/${contentId}/comments?${params.toString()}`
            );
            return response.data;
        },
    });

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: async ({
            content,
            parentId = null,
        }: {
            content: string;
            parentId?: string | null;
        }) => {
            const response = await axios.post(
                `/${type}/${contentId}/comments`,
                {
                    body: content,
                    parent_id: parentId,
                }
            );
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the comments query to refetch
            queryClient.invalidateQueries({
                queryKey: ["comments", type, contentId],
            });
        },
    });

    // Edit comment mutation
    const editCommentMutation = useMutation({
        mutationFn: async ({
            commentId,
            content,
        }: {
            commentId: string;
            content: string;
        }) => {
            const response = await axios.put(`/comments/${commentId}`, {
                body: content,
            });
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the comments query to refetch
            queryClient.invalidateQueries({
                queryKey: ["comments", type, contentId],
            });
        },
    });

    // Delete comment mutation
    const deleteCommentMutation = useMutation({
        mutationFn: async (commentId: string) => {
            const response = await axios.delete(`/comments/${commentId}`);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate the comments query to refetch
            queryClient.invalidateQueries({
                queryKey: ["comments", type, contentId],
            });
        },
    });

    // Function to fetch all comments (removing parentId filter)
    const fetchAllComments = () => {
        return queryClient.fetchQuery({
            queryKey: ["comments", type, contentId, null, null],
            queryFn: async () => {
                const response = await axios.get<CommentsResponse>(
                    `/${type}/${contentId}/comments`
                );
                return response.data;
            },
        });
    };

    return {
        commentsQuery,
        addCommentMutation,
        editCommentMutation,
        deleteCommentMutation,
        fetchAllComments,
    };
}
