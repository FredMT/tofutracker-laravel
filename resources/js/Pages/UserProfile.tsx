import ResponsiveContainer from "@/Components/ResponsiveContainer";
import UserBanner from "@/Components/UserProfile/UserBanner";
import UserProfileInfo from "@/Components/UserProfile/UserProfileInfo";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { Box, Space } from "@mantine/core";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar_url?: string;
}

interface PageProps {
    userData: UserData;
}

function UserProfile({ userData }: PageProps) {
    return (
        <>
            <Head title={`${userData.username}'s Profile`} />
            <Space h={64} />
            <UserBanner avatarUrl={"https://i.pravatar.cc/300"} />
            <ResponsiveContainer>
                <Space h={40} hiddenFrom="mdlg" />
                <Space h={4} visibleFrom="mdlg" />
                <UserProfileInfo
                    username={userData.username}
                    createdAt={userData.created_at}
                />
            </ResponsiveContainer>
        </>
    );
}

UserProfile.layout = (page: any) => <AuthenticatedLayout children={page} />;

export default UserProfile;
