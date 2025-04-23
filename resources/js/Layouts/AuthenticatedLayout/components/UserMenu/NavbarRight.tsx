import NotificationBellMenu from '@/Components/Notifications/components/NotificationBellMenu';
import ThemeButton from '@/Components/ThemeButton';
import AuthButtons from '@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons';
import UserDropdown from '@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown';
import { useAuth } from '@/propsHooks/useAuth';
import { Link } from '@inertiajs/react';
import { Group, Text } from '@mantine/core';

export default function NavbarRight() {
	const auth = useAuth();

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

				<Group
					gap={0}
					pl={20}
				>
					{auth.user && <NotificationBellMenu />}
					{auth.user ? <UserDropdown /> : <AuthButtons />}
				</Group>
				<ThemeButton />
			</Group>
		</div>
	);
}
