import { router } from '@inertiajs/react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';

interface UpdateTMDBTypeModalProps {
	mapId: number;
	currentType: 'tv' | 'movie' | null;
}

export function UpdateTMDBTypeModal({
	mapId,
	currentType,
}: UpdateTMDBTypeModalProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [value, setValue] = useState<string | null>(currentType ?? null);

	async function updateTmdbType() {
		try {
			const response = await axios.patch(
				route('admin.handleUpdateTmdbTypeForMap', { animeMap: mapId }),
				{
					tmdb_type: value,
				}
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				icon: <InfoIcon />,
				color: 'green',
			});

			if (response.data.refresh === true) {
				router.reload();
			}
			return close();
		} catch (error: any) {
			console.log(error);

			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				icon: <X />,
				color: 'red',
			});
		}
	}

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title='Update TMDB Type'
			>
				<Stack>
					<Group justify='center'>
						<Button onClick={() => setValue('tv')}>TV</Button>
						<Button onClick={() => setValue('movie')}>Movie</Button>
					</Group>
					<Text>Selection option: {value ? value : 'None selected'}</Text>
					<Group justify='flex-end'>
						<Button
							onClick={close}
							variant='default'
						>
							Cancel
						</Button>
						<Button
							color='green'
							onClick={updateTmdbType}
							disabled={Boolean(value) === false || value === currentType}
						>
							Update
						</Button>
					</Group>
				</Stack>
			</Modal>
			<Button onClick={open}>Update TMDB Type</Button>
		</>
	);
}
