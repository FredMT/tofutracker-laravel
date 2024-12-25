import UserBanner from "@/Components/UserProfile/UserBanner";
import UserProfileInfo from "@/Components/UserProfile/UserProfileInfo";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import { Box, Space } from "@mantine/core";
import { PropsWithChildren } from "react";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar_url?: string;
}

interface UserProfileLayoutProps {
    userData: UserData;
}

export default function UserProfileLayout({
    userData,
    children,
}: PropsWithChildren<UserProfileLayoutProps>) {
    return (
        <>
            <Space h={64} />
            <UserBanner avatarUrl={userData.avatar_url} />
            <Box>
                <ResponsiveContainer>
                    <Space h={40} hiddenFrom="gtmd" />
                    <Space h={4} visibleFrom="gtmd" />
                    <UserProfileInfo
                        username={userData.username}
                        createdAt={userData.created_at}
                    />
                    {children}
                </ResponsiveContainer>
            </Box>
        </>
    );
}
