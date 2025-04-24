import Logo from '@/Layouts/AuthenticatedLayout/components/Logo';
import MobileMenu from '@/Layouts/AuthenticatedLayout/components/MobileMenu';
import MobileMenuButton from '@/Layouts/AuthenticatedLayout/components/MobileMenuButton';
import NavbarRight from '@/Layouts/AuthenticatedLayout/components/UserMenu/NavbarRight';
import SearchBar from '@/Layouts/AuthenticatedLayout/components/UserMenu/SearchBar/SearchBar';
import { Box, Group } from '@mantine/core';
import { PropsWithChildren, useState } from 'react';

export default function AuthenticatedLayout({
	children,
}: PropsWithChildren<{}>) {
	const [showingNavigationDropdown, setShowingNavigationDropdown] =
		useState(false);

	return (
		<div className='min-h-screen relative'>
			<nav
				className={`fixed w-full transition-transform duration-300 z-50 backdrop-blur-xl bg-black/90`}
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
