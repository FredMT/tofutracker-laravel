import { router } from '@inertiajs/react';
import {
	Button,
	CloseButton,
	Group,
	Modal,
	Stack,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';

export function EditCollectionNameButton({ mapId }: { mapId: number }) {
	const [opened, { open, close }] = useDisclosure(false);
	const [newCollectionName, setNewCollectionName] = useState('');
	const [pending, setPending] = useState(false);

	async function updateCollectionName() {
		try {
			setPending(true);
			const response = await axios.patch(
				route('admin.patchCollectionName', { animeMap: mapId }),
				{
					collection_name: newCollectionName,
				}
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
			setPending(false);
			console.log(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}
	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title='Edit Collection Name'
			>
				<Stack gap='xl'>
					<TextInput
						mt={2}
						placeholder='Enter new collection name'
						value={newCollectionName}
						onChange={(event) =>
							setNewCollectionName(event.currentTarget.value)
						}
						autoFocus
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => {
									setNewCollectionName('');
								}}
								style={{ display: newCollectionName ? undefined : 'none' }}
							/>
						}
					/>
					<Group justify='flex-end'>
						<Button
							onClick={close}
							variant='outline'
						>
							Cancel
						</Button>
						<Button
							color='green'
							onClick={updateCollectionName}
							disabled={pending}
						>
							Save
						</Button>
					</Group>
				</Stack>
			</Modal>
			<Button onClick={open}>Edit Collection Name</Button>
		</>
	);
}
