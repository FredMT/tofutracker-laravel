import ResponsiveContainer from "@/Components/ResponsiveContainer";
import UserBanner from "@/Components/UserProfile/UserBanner";
import UserProfileInfo from "@/Components/UserProfile/UserProfileInfo";
import {Box, Divider, Space} from "@mantine/core";
import {PropsWithChildren} from "react";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar: string;
    banner: string;
    mustVerifyEmail?: boolean;
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
            <UserBanner />
            <Box>
                <ResponsiveContainer>
                    <Space h={40} hiddenFrom="gtmd" />
                    <Space h={4} visibleFrom="gtmd" />
                    <UserProfileInfo
                        username={userData.username}
                        createdAt={userData.created_at}
                    />
                    <Divider my={16} />
                    {children}
                </ResponsiveContainer>
            </Box>
        </>
    );
}
