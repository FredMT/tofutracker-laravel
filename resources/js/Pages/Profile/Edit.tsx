import BoundedContainer from '@/Components/BoundedContainer';
import SpoilerSettings from '@/Components/Edit/SpoilerSettings';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import UpdateBannerForm from '@/Pages/Profile/Partials/UpdateBannerForm';
import UpdateBioForm from '@/Pages/Profile/Partials/UpdateBioForm';
import { useUserConfiguration } from '@/propsHooks/useUserConfiguration';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Paper, Space, Stack } from '@mantine/core';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdateAvatarForm from './Partials/UpdateAvatarForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function Edit({
	mustVerifyEmail,
	status,
}: PageProps<{
	mustVerifyEmail: boolean;
	status?: string;
}>) {
	const userConfiguration = useUserConfiguration();

	return (
		<>
			<Head title='Profile' />
			<Space h={84} />

			<BoundedContainer>
				<Stack>
					<SpoilerSettings userConfiguration={userConfiguration} />

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<UpdateProfileInformationForm
							mustVerifyEmail={mustVerifyEmail}
							status={status}
						/>
					</Paper>

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<UpdateBioForm />
					</Paper>

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<UpdateAvatarForm />
					</Paper>

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<UpdateBannerForm />
					</Paper>

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<UpdatePasswordForm />
					</Paper>

					<Paper
						shadow='sm'
						p='md'
						withBorder
					>
						<DeleteUserForm />
					</Paper>
				</Stack>
			</BoundedContainer>
		</>
	);
}

Edit.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Edit;
