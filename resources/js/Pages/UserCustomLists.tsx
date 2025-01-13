import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import { UserLists } from "@/types/userCustomLists";
import { UserData } from "@/types/userData";
import { Head } from "@inertiajs/react";
import { Divider, List } from "@mantine/core";
import React from "react";

function UserCustomLists({
    userData,
    userLists,
}: {
    userData: UserData;
    userLists: UserLists;
}) {
    return (
        <>
            <Head title={`${userData.username}'s Anime`} />
            {userLists.length > 0 && (
                <List>
                    {userLists.map((list) => (
                        <List.Item key={list.id}>{list.title}</List.Item>
                    ))}
                </List>
            )}
        </>
    );
}
UserCustomLists.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserCustomLists;
