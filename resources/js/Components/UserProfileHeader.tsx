import { Group, Avatar, Stack, Title, Text } from "@mantine/core";

interface UserProfileHeaderProps {
    username: string;
}

export function UserProfileHeader({ username }: UserProfileHeaderProps) {
    return (
        <Group gap={24} w="100%" mt={24}>
            <Avatar
                src="https://avatar.iran.liara.run/public"
                alt={`${username}'s avatar`}
                size="xl"
                name={username}
                color="initials"
            />
            <Stack gap={4} justify="center">
                <Title order={4}>{username}</Title>
                <Text c="dimmed">hi :3</Text>
            </Stack>
        </Group>
    );
}
