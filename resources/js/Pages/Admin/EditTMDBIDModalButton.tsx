import { router } from '@inertiajs/react';
import { Button, CloseButton, Group, Input, Modal, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';

interface EditTMDBIDModalButtonProps {
	mapId?: number;
}

export function EditTMDBIDModalButton({ mapId }: EditTMDBIDModalButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [tmdbId, setTmdbId] = useState('');

	async function handleUpdateTmdbIdForMap() {
		try {
			const response = await axios.patch(
				route('admin.handleUpdateTmdbIdForMap', { animeMap: mapId }),
				{
					tmdb_id: tmdbId,
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
				title='Edit TMDB ID'
			>
				<Stack gap='xl'>
					<Input
						variant='filled'
						value={tmdbId?.toString()}
						onChange={(event) => setTmdbId(event.currentTarget.value)}
						placeholder='Type AniDB ID here'
						rightSectionPointerEvents='all'
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => {
									setTmdbId('');
								}}
								style={{ display: tmdbId ? undefined : 'none' }}
							/>
						}
					/>
					<Group justify='flex-end'>
						<Button
							variant='default'
							onClick={close}
						>
							Cancel
						</Button>
						<Button
							color='green'
							onClick={handleUpdateTmdbIdForMap}
						>
							Continue
						</Button>
					</Group>
				</Stack>
			</Modal>
			<Button onClick={open}>Update TMDB ID</Button>
		</>
	);
}
