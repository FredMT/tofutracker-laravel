import { router } from '@inertiajs/react';
import {
	AspectRatio,
	Button,
	Card,
	CloseButton,
	Drawer,
	Group,
	Image,
	Input,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios, { AxiosError } from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

interface RelatedEntriesNewItemDrawerProps {
	mapId: number;
}

const anidbIdSchema = z
	.string()
	.min(1, { message: 'AniDB ID cannot be empty.' })
	.max(6, { message: 'AniDB ID cannot be longer than 6 digits.' })
	.regex(/^[0-9]+$/, { message: 'AniDB ID must contain only digits.' });

type AnimeResultType = {
	id: number;
	map_id: number;
	title_main: string;
	picture: string;
};

export function RelatedEntriesNewItemDrawer({
	mapId,
}: RelatedEntriesNewItemDrawerProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [searchAnidbId, setSearchAnidbId] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);
	const [animeResult, setAnimeResult] = useState<AnimeResultType | null>(null);

	const handleInputChange = (value: string) => {
		setSearchAnidbId(value);
		const result = anidbIdSchema.safeParse(value);
		if (!result.success) {
			setValidationError(result.error.errors.map((e) => e.message).join(' '));
		} else {
			setValidationError(null);
		}
	};

	const handleShowAnime = async () => {
		try {
			setAnimeResult(null);
			const response = await axios.get(
				route('admin.findAnimeByAnidbId', {
					animeId: searchAnidbId,
				})
			);
			setAnimeResult(response.data.anime);
		} catch (error: any) {
			notifications.show({
				title: 'Error',
				message: error.message,
				color: 'red',
				icon: <X />,
			});
		}
	};

	const handleAddToRelatedAnime = async () => {
		if (!animeResult)
			return notifications.show({
				title: 'Error',
				message: 'You need a valid anime',
				color: 'red',
				icon: <X />,
			});

		try {
			const response = await axios.post(
				route('admin.addNewRelatedAnimetoAnimeCollection'),
				{
					anidb_id: animeResult?.id,
					map_id: mapId,
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
			console.log(error.response.data.message || error.message);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || 'Something went wrong.',
				color: 'red',
				icon: <X />,
			});
		}
	};

	return (
		<>
			<Drawer
				opened={opened}
				onClose={close}
				title='Add New Related Entry'
				position='right'
				size={'40rem'}
			>
				<Stack>
					<Text>Map ID: {mapId}</Text>
					<Group>
						<Input
							variant='filled'
							value={searchAnidbId}
							onChange={(event) => handleInputChange(event.currentTarget.value)}
							placeholder='Type AniDB ID here'
							error={validationError}
							rightSectionPointerEvents='all'
							rightSection={
								<CloseButton
									aria-label='Clear input'
									onClick={() => {
										setSearchAnidbId('');
										setValidationError(null);
									}}
									style={{ display: searchAnidbId ? undefined : 'none' }}
								/>
							}
						/>
						<Button
							onClick={handleShowAnime}
							disabled={!!validationError || searchAnidbId.length < 1}
						>
							Find anime by AniDB ID
						</Button>
					</Group>
					{animeResult && (
						<Card>
							<Group align='flex-start'>
								<AspectRatio ratio={2 / 3}>
									<Image
										src={`https://anidb.net/images/main/${animeResult.picture}`}
										alt={animeResult.title_main}
										mah={150}
									/>
								</AspectRatio>
								<Stack>
									<Group>
										<Text>ID: {animeResult.id}</Text>
										<a
											href={`https://anidb.net/anime/${animeResult.id}`}
											target='_blank'
										>
											<Button>Visit AniDB</Button>
										</a>
									</Group>
									<Text>Title: {animeResult.title_main}</Text>
									{animeResult.map_id ? (
										<Group>
											<Text>Map ID: {animeResult.map_id}</Text>
											<a
												href={route('admin.showAdminAnimeCollectionPage', {
													animeMap: animeResult.map_id,
												})}
												target='_blank'
											>
												<Button>Visit</Button>
											</a>
										</Group>
									) : (
										<Text>Map ID: Not connected to any anime collection</Text>
									)}
								</Stack>
							</Group>
							<Button
								disabled={animeResult && animeResult.map_id !== null}
								mt={10}
								onClick={handleAddToRelatedAnime}
							>
								{animeResult && animeResult.map_id !== null
									? 'Cannot Add because it already exists in an anime map'
									: `Add as related entry to ${mapId}`}
							</Button>
						</Card>
					)}
				</Stack>
			</Drawer>

			<Button
				size='xs'
				onClick={open}
			>
				Add new related item
			</Button>
		</>
	);
}
