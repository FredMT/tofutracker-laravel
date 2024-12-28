import UserOverviewLayout from "@/Components/UserOverviewLayout";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { Head } from "@inertiajs/react";
import { Divider, Paper, Stack, Text, Title } from "@mantine/core";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar: string;
    banner: string;
    bio: string;
}

interface PageProps {
    userData: UserData;
    activities: any;
}

function UserProfile({ userData, activities }: PageProps) {
    console.log(activities);
    const bioSection = (
        <Paper>
            <Stack>
                <Title order={3} c="dimmed">
                    Bio
                </Title>
                <Text>{userData.bio}</Text>
            </Stack>
        </Paper>
    );

    const activitySection = (
        <Stack>
            <Title order={2} c="dimmed">
                Activity
            </Title>
            {/* Activity content will go here */}
        </Stack>
    );

    return (
        <>
            <Head title={`${userData.username}'s Activity`} />
            <Divider my={16} />
            <UserOverviewLayout
                leftSection={bioSection}
                rightSection={activitySection}
                leftWidth={400}
                rightWidth={600}
                gap={16}
            />
        </>
    );
}

UserProfile.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserProfile;
