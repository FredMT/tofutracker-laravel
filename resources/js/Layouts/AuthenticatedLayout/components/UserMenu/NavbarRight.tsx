import NotificationBellMenu from '@/Components/Notifications/components/NotificationBellMenu';
import ThemeButton from '@/Components/ThemeButton';
import AuthButtons from '@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons';
import UserDropdown from '@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown';
import { usePage } from '@inertiajs/react';
import { ActionIcon, Group } from '@mantine/core';
import ScheduleLinkActionIcon from './ScheduleLinkActionIcon';
import { UserRoundCog } from 'lucide-react';
import { useAuth } from '@/propsHooks/useAuth';
import { usePermissions } from '@/propsHooks/usePermissions';

export default function NavbarRight() {
	const auth = useAuth();
	const component = usePage().component;
	const permissions = usePermissions();

	const path = window.location.pathname;

	return (
		<div className='hidden sm:ms-6 sm:flex sm:items-center'>
			<Group gap={16}>
				{permissions.is_superuser && !path.startsWith('/admin') && (
					<ActionIcon
						variant='light'
						size='lg'
						color='red'
						component='a'
						href={route('admin.show')}
						target='_blank'
					>
						<UserRoundCog />
					</ActionIcon>
				)}
				{component !== 'Schedule' && <ScheduleLinkActionIcon />}
				<ThemeButton />
				{auth.user && <NotificationBellMenu />}
				{auth.user ? <UserDropdown /> : <AuthButtons />}
			</Group>
		</div>
	);
}
