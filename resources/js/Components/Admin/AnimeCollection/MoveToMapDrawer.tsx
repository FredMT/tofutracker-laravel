import { Drawer, Tabs } from '@mantine/core';
import { ExistingMapTabContent } from './MoveToMapDrawer/ExistingMapTabContent';

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
			<ExistingMapTabContent
				animeId={props.animeId}
				chainId={props.chainId}
			/>
		</Drawer>
	);
}
