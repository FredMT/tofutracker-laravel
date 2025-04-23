import { PropsWithChildren, useEffect, useState, useRef } from 'react';
import styles from './AuthenticatedLayout.module.css';
import Logo from '@/Layouts/AuthenticatedLayout/components/Logo';
import MobileMenuButton from '@/Layouts/AuthenticatedLayout/components/MobileMenuButton';
import MobileMenu from '@/Layouts/AuthenticatedLayout/components/MobileMenu';
import { Box, Group, Text } from '@mantine/core';
import SearchBar from '@/Layouts/AuthenticatedLayout/components/UserMenu/SearchBar/SearchBar';
import NavbarRight from '@/Layouts/AuthenticatedLayout/components/UserMenu/NavbarRight';
import { useNavbarColor } from '@/propsHooks/useNavbarColor';

export default function AuthenticatedLayout({
	children,
}: PropsWithChildren<{}>) {
	const [showingNavigationDropdown, setShowingNavigationDropdown] =
		useState(false);
	const { backgroundStyle, gradientStyle } = useNavbarColor();

	return (
		<div className='min-h-screen relative'>
			<nav
				className={`border-b fixed w-full transition-transform duration-300 z-50 backdrop-blur-md ${styles.navbar} ${backgroundStyle}`}
				style={{
					background: gradientStyle || undefined,
				}}
			>
				<div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
					<div className='flex h-16 justify-between'>
						<Group>
							<Logo />
							<Box visibleFrom='sixtyem'>
								<SearchBar />
							</Box>
						</Group>
						<NavbarRight />
						<MobileMenuButton
							showingNavigationDropdown={showingNavigationDropdown}
							setShowingNavigationDropdown={setShowingNavigationDropdown}
						/>
					</div>
				</div>
				<MobileMenu showingNavigationDropdown={showingNavigationDropdown} />
			</nav>

			<main>{children}</main>
		</div>
	);
}
