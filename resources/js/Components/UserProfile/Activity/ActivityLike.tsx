import { ActionIcon, Group, Text } from "@mantine/core";
import { Heart } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Auth } from "@/types";

interface ActivityLikeProps {
    activityId: number;
    initialLikesCount: number;
    isLiked: boolean;
}

export function ActivityLike({
    activityId,
    initialLikesCount,
    isLiked: initialIsLiked,
}: ActivityLikeProps) {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const { auth } = usePage<{ auth: Auth }>().props;

    const handleLike = () => {
        if (!auth.user) {
            router.visit(route("login"));
            return;
        }

        // Optimistically update the UI
        const newIsLiked = !isLiked;
        const newLikesCount = likesCount + (newIsLiked ? 1 : -1);

        setIsLiked(newIsLiked);
        setLikesCount(newLikesCount);

        router.post(
            route("activity.like.toggle", { activity: activityId }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                // If the request fails, revert the optimistic update
                onError: () => {
                    setIsLiked(isLiked);
                    setLikesCount(likesCount);
                },
                onSuccess: () => {},
            }
        );
    };

    return (
        <Group gap={1}>
            <ActionIcon
                variant="subtle"
                onClick={handleLike}
                color={isLiked ? "red" : "gray"}
            >
                <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            </ActionIcon>
            <Text size="xs">{likesCount !== 0 ? likesCount : null}</Text>
        </Group>
    );
}
