import UserOverviewLayout from "@/Components/UserOverviewLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { Head } from "@inertiajs/react";
import { Divider, Paper, Stack, Text, Title } from "@mantine/core";
import ActivitySection from "@/Components/UserProfile/Activity/ActivitySection";
import BoundedContainer from "@/Components/BoundedContainer";
import ResponsiveContainer from "@/Components/ResponsiveContainer";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar: string;
    banner: string;
    bio: string;
    mustVerifyEmail?: boolean;
}

interface PageProps {
    userData: UserData;
}

function UserProfile({ userData }: PageProps) {
    const leftSection = (
        <Paper>
            <Stack>
                <Title order={3} c="dimmed">
                    Bio
                </Title>
                <Text>{userData.bio}</Text>
            </Stack>
        </Paper>
    );

    const rightSection = (
        <Stack>
            <Title order={2} c="dimmed">
                Activity
            </Title>
            <ActivitySection />
        </Stack>
    );

    return (
        <>
            <Head title={`${userData.username}'s Activity`} />
            <Divider my={16} />
            <ResponsiveContainer>
                <UserOverviewLayout
                    leftSection={leftSection}
                    rightSection={rightSection}
                    leftWidth={400}
                    gap={16}
                />
            </ResponsiveContainer>
        </>
    );
}

UserProfile.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserProfile;
