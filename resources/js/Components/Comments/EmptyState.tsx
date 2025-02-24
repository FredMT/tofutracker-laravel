import { Stack, Text } from "@mantine/core";

export const EmptyState = () => {
    return (
        <Stack align="center" py="md">
            <Text size="lg" c="dimmed" ta="center">
                No comments yet
            </Text>
            <Text size="sm" c="dimmed" ta="center">
                Be the first to start a discussion!
            </Text>
        </Stack>
    );
};
