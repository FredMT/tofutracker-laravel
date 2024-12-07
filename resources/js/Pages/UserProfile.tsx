import ResponsiveContainer from "@/Components/ResponsiveContainer";
import ThemeButton from "@/Components/ThemeButton";
import UserImage from "@/Components/UserImage";
import { PageProps } from "@/types";
import { formatJoinDate } from "@/utils/formatter";
import { Head, usePage } from "@inertiajs/react";
import {
    Avatar,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    Stack,
    Tabs,
    Text,
    Title,
} from "@mantine/core";
import ProfileLayout from "@/Layouts/ProfileLayout";

export default function UserProfile() {
    const { props } = usePage();

    const leftContent = (
        <Group gap={24} w="100%" mt={24}>
            <Avatar
                src="https://avatar.iran.liara.run/public"
                alt={`${props.auth.user.username}'s avatar`}
                size="xl"
                name={props.auth.user.username}
                color="initials"
            />
            <Stack gap={4} justify="center">
                <Title order={4}>{props.auth.user.username}</Title>
                <Text c="dimmed">hi :3</Text>
            </Stack>
        </Group>
    );

    const rightContent = (
        <Stack>
            <Divider my={16} />
            <Group wrap="wrap" gap={36} align="center" justify="center">
                <Text>Joined July 2023</Text>
                <Text>893 hrs watched</Text>
                <Text>Action</Text>
                <Text>293 likes recieved</Text>
            </Group>
            <Divider my={16} />
            <Tabs defaultValue="movies" variant="outline">
                <Tabs.List grow>
                    <Tabs.Tab value="movies">Activity</Tabs.Tab>
                    <Tabs.Tab value="tv">Library</Tabs.Tab>
                </Tabs.List>
            </Tabs>
        </Stack>
    );

    return (
        <>
            <Head title="User Profile" />
            <UserImage />
            <Container size={1200}>
                <ProfileLayout left={leftContent} right={rightContent} />
            </Container>
        </>
    );
}
