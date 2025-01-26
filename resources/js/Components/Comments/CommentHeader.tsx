import { Group, Text } from "@mantine/core";

interface CommentHeaderProps {
    author: string | null;
    points: number;
    timeAgo: string;
}

export function CommentHeader({ author, points, timeAgo }: CommentHeaderProps) {
    return (
        <Group gap={8}>
            <Text size="xs">{author ?? "[removed]"}</Text>
            <Text size="xs">{points} points</Text>
            <Text size="xs" c="dimmed">
                {timeAgo}
            </Text>
        </Group>
    );
}
