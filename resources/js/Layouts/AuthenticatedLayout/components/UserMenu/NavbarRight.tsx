import NotificationBellMenu from '@/Components/Notifications/components/NotificationBellMenu';
import ThemeButton from '@/Components/ThemeButton';
import AuthButtons from '@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons';
import UserDropdown from '@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { ActionIcon, Button, Group } from '@mantine/core';
import ScheduleLinkActionIcon from './ScheduleLinkActionIcon';
import { UserRoundCog } from 'lucide-react';

export default function NavbarRight() {
	const {
		auth: { user },
		permissions,
	} = usePage<PageProps>().props;
	const component = usePage().component;
	return (
		<div className='hidden sm:ms-6 sm:flex sm:items-center'>
			<Group gap={16}>
				{permissions.is_superuser && (
					<ActionIcon
						variant='outline'
						size='lg'
						component='a'
						href={route('admin.show')}
						target='_blank'
					>
						<UserRoundCog />
					</ActionIcon>
				)}
				{component !== 'Schedule' && <ScheduleLinkActionIcon />}
				<ThemeButton />
				{user && <NotificationBellMenu />}
				{user ? <UserDropdown /> : <AuthButtons />}
			</Group>
		</div>
	);
}
