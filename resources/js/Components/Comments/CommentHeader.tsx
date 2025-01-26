import { Group, Text } from "@mantine/core";

interface CommentHeaderProps {
    author: string | null;
    points: number;
    timeAgo: string;
    isEdited: boolean;
    isDeleted: boolean;
}

export function CommentHeader({
    author,
    points,
    timeAgo,
    isEdited,
    isDeleted,
}: CommentHeaderProps) {
    return (
        <Group gap={8}>
            <Text size="xs">{author ?? "[removed]"}</Text>
            <Text size="xs">{points} points</Text>
            <Text size="xs" c="dimmed">
                {`${isEdited ? "edited" : ""} ${
                    isDeleted ? "deleted" : ""
                } ${timeAgo}`}
            </Text>
        </Group>
    );
}
