import { Drawer, Tabs } from '@mantine/core';
import { ExistingMapTabContent } from './MoveToMapDrawer/ExistingMapTabContent';
import { NewMapTabContent } from './MoveToMapDrawer/NewMapTabContent';

export function MoveToMapDrawer(props: {
	opened: boolean;
	onClose: () => void;
	animeId: number;
	chainId: number;
}) {
	return (
		<Drawer
			opened={props.opened}
			onClose={props.onClose}
			title='Move to map'
			position='right'
			size='40rem'
		>
			<Tabs defaultValue='existing-map'>
				<Tabs.List>
					<Tabs.Tab value='existing-map'>Move to Existing Map</Tabs.Tab>
					<Tabs.Tab value='new-map'>Move to New Map</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='existing-map'>
					<ExistingMapTabContent
						animeId={props.animeId}
						chainId={props.chainId}
					/>
				</Tabs.Panel>

				<Tabs.Panel value='new-map'>
					<NewMapTabContent />
				</Tabs.Panel>
			</Tabs>
		</Drawer>
	);
}
