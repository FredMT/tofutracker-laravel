import { ChainEntry } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { router } from '@inertiajs/react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon } from 'lucide-react';

type ChainEntryDeleteButtonProps = {
	mapId: number;
	entry: ChainEntry;
};

export function ChainEntryDeleteButton({
	mapId,
	entry,
}: ChainEntryDeleteButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);

	async function handleDeleteChainEntry(chainId: number, entryId: number) {
		try {
			const response = await axios.delete(
				route('admin.deleteItemFromChainEntry', {
					animeChain: chainId,
					chainEntry: entryId,
				})
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			router.visit(
				route('admin.showAdminAnimeCollectionPage', { animeMap: mapId })
			);
		} catch (error: any) {
			console.log(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'green',
				icon: <InfoIcon />,
			});
		}
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title='Delete chain entry?'
			>
				<Stack>
					<Text>
						{' '}
						Are you sure you want to delete anime ID: {entry.id} from the chain:{' '}
						{entry.chain_id}?
					</Text>
					<Group>
						<Button onClick={close}>Cancel</Button>
						<Button
							color='red'
							onClick={() => handleDeleteChainEntry(entry.chain_id, entry.id)}
						>
							Delete
						</Button>
					</Group>
				</Stack>
			</Modal>
			<Button
				color='red'
				size='xs'
				onClick={open}
			>
				Delete
			</Button>
		</>
	);
}
