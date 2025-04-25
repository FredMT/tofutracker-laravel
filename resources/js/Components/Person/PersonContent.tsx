import { useEffect, useRef } from 'react';
import { usePersonContext } from '@/Components/Person/store/personStore';
import { Box, Space } from '@mantine/core';
import PersonHeader from '@/Components/Person/PersonHeader';
import PersonSidebar from '@/Components/Person/PersonSidebar';
import PersonProfile from '@/Components/Person/PersonProfile';
import PersonStats from '@/Components/Person/PersonStats';
import PersonActions from '@/Components/Person/PersonActions';
import PersonMediaTabs from '@/Components/Person/PersonMediaTabs';
import { getMediaItem, getTvMediaItem } from '@/Components/Person/PersonUtils';

export function PersonContent() {
	const tabsRef = useRef<HTMLDivElement>(null);
	const setActiveTab = usePersonContext((state) => state.setActiveTab);
	const updateComputedValues = usePersonContext(
		(state) => state.updateComputedValues
	);

	useEffect(() => {
		updateComputedValues();
	}, [updateComputedValues]);

	const switchTabAndScroll = (tabValue: string) => {
		setActiveTab(tabValue);

		if (tabsRef.current) {
			tabsRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
	};

	return (
		<>
			<Space h={64} />
			<Box className='min-h-screen bg-dark'>
				<PersonHeader />

				<Box className='container mx-auto px-4 md:pt-0 relative'>
					<Box className='flex flex-col md:flex-row'>
						<PersonSidebar onTabChange={switchTabAndScroll} />

						<Box className='flex-1'>
							<PersonProfile />

							<PersonStats />

							<PersonActions />

							<PersonMediaTabs
								tabsRef={tabsRef}
								getMediaItem={getMediaItem}
								getTvMediaItem={getTvMediaItem}
							/>
						</Box>
					</Box>
				</Box>
			</Box>
			<Space h='xl' />
		</>
	);
}
