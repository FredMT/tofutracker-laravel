import NotificationBellMenu from '@/Components/Notifications/components/NotificationBellMenu';
import ThemeButton from '@/Components/ThemeButton';
import AuthButtons from '@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons';
import UserDropdown from '@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown';
import { useAuth } from '@/propsHooks/useAuth';
import { usePermissions } from '@/propsHooks/usePermissions';
import { Link, usePage } from '@inertiajs/react';
import { ActionIcon, Group, Text } from '@mantine/core';
import { UserRoundCog } from 'lucide-react';

export default function NavbarRight() {
	const auth = useAuth();
	const permissions = usePermissions();

	const path = window.location.pathname;

	const isCurrentPath = (linkPath: string) =>
		path === linkPath || path.startsWith(linkPath);

	return (
		<div className='hidden sm:ms-6 sm:flex sm:items-center'>
			<Group gap={16}>
				{isCurrentPath('/movies') ? (
					<Text fw={500}>Movies</Text>
				) : (
					<Text
						component={Link}
						href='/movies'
						fw={500}
						prefetch
					>
						Movies
					</Text>
				)}

				{isCurrentPath('/shows') ? (
					<Text fw={500}>Shows</Text>
				) : (
					<Text
						component={Link}
						href='/shows'
						fw={500}
						prefetch
					>
						Shows
					</Text>
				)}

				{isCurrentPath('/anime') ? (
					<Text fw={500}>Anime</Text>
				) : (
					<Text
						component={Link}
						href='/anime'
						fw={500}
						prefetch
					>
						Anime
					</Text>
				)}

				{isCurrentPath('/schedule') ? (
					<Text fw={500}>Schedule</Text>
				) : (
					<Text
						fw={500}
						component={Link}
						href='/schedule'
					>
						Schedule
					</Text>
				)}

				{auth.user ? <UserDropdown /> : <AuthButtons />}
				{auth.user && <NotificationBellMenu />}
				<ThemeButton />
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
			</Group>
		</div>
	);
}
