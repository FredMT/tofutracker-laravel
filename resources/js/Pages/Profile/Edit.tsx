import {PageProps} from "@/types";
import {Head} from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UpdateAvatarForm from "./Partials/UpdateAvatarForm";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import {Paper, Space, Stack} from "@mantine/core";
import BoundedContainer from "@/Components/BoundedContainer";
import UpdateBannerForm from "@/Pages/Profile/Partials/UpdateBannerForm";
import UpdateBioForm from "@/Pages/Profile/Partials/UpdateBioForm";

function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{
    mustVerifyEmail: boolean;
    status?: string;
}>) {
    return (
        <>
            <Head title="Profile" />
            <Space h={84} />

            <BoundedContainer>
                <Stack>
                    <Paper shadow="sm" p="md" withBorder>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </Paper>

                    <Paper shadow="sm" p="md" withBorder>
                        <UpdateBioForm />
                    </Paper>

                    <Paper shadow="sm" p="md" withBorder>
                        <UpdateAvatarForm />
                    </Paper>

                    <Paper shadow="sm" p="md" withBorder>
                        <UpdateBannerForm />
                    </Paper>

                    <Paper shadow="sm" p="md" withBorder>
                        <UpdatePasswordForm />
                    </Paper>

                    <Paper shadow="sm" p="md" withBorder>
                        <DeleteUserForm />
                    </Paper>
                </Stack>
            </BoundedContainer>
        </>
    );
}

Edit.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Edit;
