import { MoveToMapDrawer } from '@/Components/Admin/AnimeCollection/MoveToMapDrawer';
import { Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

interface MovePopoverButtonProps {
	animeId: number;
	chainId: number;
}

export function ChainEntryMoveDrawerButton({
	animeId,
	chainId,
}: MovePopoverButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);

	return (
		<>
			<MoveToMapDrawer
				opened={opened}
				onClose={close}
				animeId={animeId}
				chainId={chainId}
			/>

			<Button
				color='violet.7'
				onClick={open}
			>
				Move
			</Button>
		</>
	);
}
