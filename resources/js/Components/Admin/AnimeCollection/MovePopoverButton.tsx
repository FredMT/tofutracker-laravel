import { Button, Menu } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MoveToMapDrawer } from "@/Components/Admin/AnimeCollection/MoveToMapDrawer";
import { MoveToChainDrawer } from "@/Components/Admin/AnimeCollection/MoveToChainDrawer";
import { MoveToRelatedDrawer } from "@/Components/Admin/AnimeCollection/MoveToRelatedDrawer";

interface MovePopoverButtonProps {
	animeId: number,
	chainId: number
}

export function MovePopoverButton({ animeId, chainId }: MovePopoverButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [chainOpened, { open: chainOpen, close: chainClose }] =
		useDisclosure(false);
	const [relatedOpened, { open: relatedOpen, close: relatedClose }] =
		useDisclosure(false);

	return (
		<>
			<MoveToMapDrawer
				opened={opened}
				onClose={close}
				animeId={animeId}
				chainId={chainId}
			/>
			<MoveToChainDrawer
				opened={chainOpened}
				onClose={chainClose}
			/>
			<MoveToRelatedDrawer
				opened={relatedOpened}
				onClose={relatedClose}
			/>
			<Menu
				shadow="md"
				width={200}
			>
				<Menu.Target>
					<Button color="violet.7">Move</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>Move to</Menu.Label>
					<Menu.Item onClick={open}>To map</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={chainOpen}>To chain</Menu.Item>
					<Menu.Divider />
					<Menu.Item onClick={relatedOpen}>To related</Menu.Item>
				</Menu.Dropdown>
			</Menu>
		</>
	);
}
