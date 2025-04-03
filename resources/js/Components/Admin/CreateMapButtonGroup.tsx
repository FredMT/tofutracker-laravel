import { router } from '@inertiajs/react';
import {
	Button,
	ButtonGroup,
	CloseButton,
	Divider,
	Drawer,
	Stack,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { z } from 'zod';

const createAnimeMapChainEntrySchema = z.object({
	tmdbId: z.string().nullable(),
	tmdbType: z.enum(['tv', 'movie']).nullable(),
	collectionName: z.string().nullable(),
});

type CreateMapButtonGroupProps = {
	id: number;
	loadingOverlayVisible: Dispatch<SetStateAction<boolean>>;
};

export function CreateMapButtonGroup({
	id,
	loadingOverlayVisible,
}: CreateMapButtonGroupProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [tmdbId, setTmdbId] = useState('');
	const [tmdbType, setTmdbType] = useState('');
	const [collectionName, setCollectionName] = useState('');
	const [isFormValid, setIsFormValid] = useState(false);

	useEffect(() => {
		const result = createAnimeMapChainEntrySchema.safeParse({
			tmdbId,
			tmdbType,
			collectionName,
		});
		setIsFormValid(result.success);
	}, [tmdbId, tmdbType, collectionName]);

	const createAnimeMapChainEntry = () => {
		loadingOverlayVisible(true);
		axios
			.post(route('admin.createAnimeMapChainEntry'), {
				anidb_id: id,
			})
			.then((res) => {
				if (res.status === 201) {
					notifications.show({
						title: 'Success',
						message: 'Anime Map and Chain Entry created successfully',
						icon: <InfoIcon />,
						color: 'green',
					});
				}
				router.visit(route('admin.showAdminAnime', { anime_id: id }));
			})
			.catch((e) => {
				notifications.show({
					title: 'Error',
					message: e.response.data.message || 'Some error occurred, check logs',
					icon: <X />,
					color: 'red',
				});
			})
			.finally(() => {
				loadingOverlayVisible(false);
			});
	};
	return (
		<>
			<Drawer
				opened={opened}
				onClose={close}
				title='Anime Map Chain Entry '
				position='right'
			>
				<Stack>
					<TextInput
						placeholder='TMDB ID'
						label='TMDB ID'
						value={tmdbId}
						onChange={(event) => setTmdbId(event.currentTarget.value)}
						rightSectionPointerEvents='all'
						mt='md'
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => setTmdbId('')}
								style={{ display: tmdbId ? undefined : 'none' }}
							/>
						}
					/>
					<TextInput
						placeholder='TMDB Type'
						label='TMDB Type'
						value={tmdbType}
						onChange={(event) => setTmdbType(event.currentTarget.value)}
						rightSectionPointerEvents='all'
						mt='md'
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => setTmdbType('')}
								style={{ display: tmdbType ? undefined : 'none' }}
							/>
						}
					/>
					<TextInput
						placeholder='Collection Name'
						label='Collection Name'
						value={collectionName}
						onChange={(event) => setCollectionName(event.currentTarget.value)}
						rightSectionPointerEvents='all'
						mt='md'
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => setCollectionName('')}
								style={{ display: collectionName ? undefined : 'none' }}
							/>
						}
					/>
					<Button
						onClick={createAnimeMapChainEntry}
						disabled={!isFormValid}
					>
						Create Anime Map With Chain Entry
					</Button>
				</Stack>
			</Drawer>
			<Button onClick={open}>As Chain Entry</Button>
		</>
	);
}
