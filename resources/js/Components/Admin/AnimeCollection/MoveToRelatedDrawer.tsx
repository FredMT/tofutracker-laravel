import { Drawer } from "@mantine/core";

export function MoveToRelatedDrawer(props: { opened: boolean; onClose: () => void }) {
	return (
		<Drawer
			opened={props.opened}
			onClose={props.onClose}
			title="Move to related"
			position="right"
			size="40rem"
		>
			{/* Drawer content */}
		</Drawer>
	);
}