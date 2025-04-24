import NotificationBellMenu from '@/Components/Notifications/components/NotificationBellMenu';
import ThemeButton from '@/Components/ThemeButton';
import AuthButtons from '@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons';
import UserDropdown from '@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown';
import { useAuth } from '@/propsHooks/useAuth';
import { Link } from '@inertiajs/react';
import { Group, Text, useComputedColorScheme } from '@mantine/core';
import { useHover } from '@mantine/hooks';

export default function NavbarRight() {
	const auth = useAuth();

	const computedColorScheme = useComputedColorScheme('light', {
		getInitialValueInEffect: true,
	});

	const isDark = computedColorScheme === 'dark';

	const path = window.location.pathname;

	const isCurrentPath = (linkPath: string) =>
		path === linkPath || path.startsWith(linkPath);

	const { hovered: moviesHovered, ref: moviesRef } = useHover();
	const { hovered: showsHovered, ref: showsRef } = useHover();
	const { hovered: animeHovered, ref: animeRef } = useHover();
	const { hovered: scheduleHovered, ref: scheduleRef } = useHover();

	return (
		<div className='hidden sm:ms-6 sm:flex sm:items-center'>
			<Group gap={16}>
				{isCurrentPath('/movies') ? (
					<Text
						fw={500}
						c={isDark ? 'grape' : 'violet.9'}
					>
						Movies
					</Text>
				) : (
					<Text
						component={Link}
						href='/movies'
						fw={500}
						ref={moviesRef}
						prefetch
						c={moviesHovered ? 'grape' : 'white'}
					>
						Movies
					</Text>
				)}

				{isCurrentPath('/shows') ? (
					<Text
						fw={500}
						c={isDark ? 'grape' : 'violet.9'}
					>
						Shows
					</Text>
				) : (
					<Text
						component={Link}
						href='/shows'
						fw={500}
						ref={showsRef}
						prefetch
						c={showsHovered ? 'grape' : 'white'}
					>
						Shows
					</Text>
				)}

				{isCurrentPath('/anime') ? (
					<Text
						fw={500}
						c={isDark ? 'grape' : 'violet.9'}
					>
						Anime
					</Text>
				) : (
					<Text
						component={Link}
						href='/anime'
						fw={500}
						ref={animeRef}
						prefetch
						c={animeHovered ? 'grape' : 'white'}
					>
						Anime
					</Text>
				)}

				{isCurrentPath('/schedule') ? (
					<Text
						fw={500}
						c={isDark ? 'grape' : 'violet.9'}
					>
						Schedule
					</Text>
				) : (
					<Text
						fw={500}
						component={Link}
						href='/schedule'
						ref={scheduleRef}
						prefetch
						c={scheduleHovered ? 'grape' : 'white'}
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
