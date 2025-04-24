import { CreateListForm } from '@/Components/ContentActions/components/Actions/ManageCustomList/components/CreateListForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import UserProfileLayout from '@/Layouts/UserProfileLayout';
import { Head } from '@inertiajs/react';
import { Button, Drawer, Modal, Stack } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useUserData } from '@/propsHooks/useUserData';
import { useAuth } from '@/propsHooks/useAuth';
import { useUserCustomLists } from '@/propsHooks/useUserCustomLists';
import { UserCustomList as UserCustomListType } from '@/types/userCustomLists';
import UserCustomList from '@/Components/UserCustomLists/components/UserCustomList';

function UserCustomLists() {
	const userData = useUserData();
	const userLists = useUserCustomLists();
	const auth = useAuth();
	const [showCreateForm, setShowCreateForm] = useState(false);
	const { width } = useViewportSize();
	const isDesktop = width >= 768;

	return (
		<>
			<Head title={`${userData.username}'s Anime`} />
			<Stack align='flex-start'>
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
						title='Create New List'
					>
						<CreateListForm closeCreate={() => setShowCreateForm(false)} />
					</Modal>
				) : (
					<Drawer
						opened={showCreateForm}
						onClose={() => setShowCreateForm(false)}
						title='Create New List'
						position='bottom'
						size='sm'
					>
						<CreateListForm closeCreate={() => setShowCreateForm(false)} />
					</Drawer>
				)}

				<Stack>
					{userLists &&
						userLists.map((list: UserCustomListType) => (
							<UserCustomList key={list.id} />
						))}
				</Stack>
			</Stack>
		</>
	);
}

UserCustomLists.layout = (page: any) => (
	<AuthenticatedLayout>
		<UserProfileLayout
			children={page}
			userData={page.props.userData}
		/>
	</AuthenticatedLayout>
);

export default UserCustomLists;
