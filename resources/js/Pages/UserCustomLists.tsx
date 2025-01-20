import {
    CreateListForm
} from "@/Components/ContentActions/components/Actions/ManageCustomList/components/CreateListForm";
import UserCustomList from "@/Components/UserCustomLists/components/UserCustomList";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import UserProfileLayout from "@/Layouts/UserProfileLayout";
import {Auth} from "@/types";
import {UserList, UserLists} from "@/types/userCustomLists";
import {UserData} from "@/types/userData";
import {Head} from "@inertiajs/react";
import {Button, Drawer, Modal, Stack} from "@mantine/core";
import {useViewportSize} from "@mantine/hooks";
import {PlusIcon} from "lucide-react";
import {useState} from "react";

function UserCustomLists({
    userData,
    userLists,
    auth,
}: {
    userData: UserData;
    userLists: UserLists;
    auth: Auth;
}) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { width } = useViewportSize();
    const isDesktop = width >= 768;

    return (
        <>
            <Head title={`${userData.username}'s Anime`} />
            <Stack align="flex-start">
                {auth?.user?.username === userData.username && (
                    <Button
                        leftSection={<PlusIcon size={16} />}
                        onClick={() => setShowCreateForm(true)}
                    >
                        Create List
                    </Button>
                )}

                {isDesktop ? (
                    <Modal
                        opened={showCreateForm}
                        onClose={() => setShowCreateForm(false)}
                        title="Create New List"
                        centered
                    >
                        <CreateListForm
                            closeCreate={() => setShowCreateForm(false)}
                        />
                    </Modal>
                ) : (
                    <Drawer
                        opened={showCreateForm}
                        onClose={() => setShowCreateForm(false)}
                        title="Create New List"
                        position="bottom"
                        size="sm"
                    >
                        <CreateListForm
                            closeCreate={() => setShowCreateForm(false)}
                        />
                    </Drawer>
                )}

                <Stack>
                    {userLists &&
                        userLists.map((list: UserList) => (
                            <UserCustomList list={list} key={list.id} />
                        ))}
                </Stack>
            </Stack>
        </>
    );
}

UserCustomLists.layout = (page: any) => (
    <AuthenticatedLayout>
        <UserProfileLayout children={page} userData={page.props.userData} />
    </AuthenticatedLayout>
);

export default UserCustomLists;
