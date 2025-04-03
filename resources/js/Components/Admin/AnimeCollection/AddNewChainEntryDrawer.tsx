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
	Select,
	TextInput,
	Divider,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

type AddNewChainEntryDrawerProps = {
	opened: boolean;
	close: () => void;
	chainIdsAndNames: { id: string; name: string }[];
	mapId: number;
};

type AnimeResultType = {
	id: number;
	map_id: number;
	title_main: string;
	picture: string;
};

const anidbIdSchema = z
	.string()
	.min(1, { message: 'AniDB ID cannot be empty.' })
	.max(6, { message: 'AniDB ID cannot be longer than 6 digits.' })
	.regex(/^[0-9]+$/, { message: 'AniDB ID must contain only digits.' });

export function AddNewChainEntryDrawer({
	opened,
	close,
	chainIdsAndNames,
	mapId,
}: AddNewChainEntryDrawerProps) {
	const [searchAnidbId, setSearchAnidbId] = useState('');
	const [validationError, setValidationError] = useState<string | null>(null);
	const [animeResult, setAnimeResult] = useState<AnimeResultType | null>(null);
	const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
	const [newChainName, setNewChainName] = useState<string>('');
	const [isCreatingNewChain, setIsCreatingNewChain] = useState<boolean>(false);

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

	async function handleAddChainEntry(
		mapId: number,
		isCreatingNewChain: boolean,
		chainName: string | null,
		chainId: number | undefined,
		entryId: number
	) {
		if (isCreatingNewChain) {
			try {
				const response = await axios.post(
					route('admin.createAnimeChainAndEntry'),
					{
						chain_name: chainName,
						anime_id: entryId,
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
				console.log(error);
				notifications.show({
					title: 'Error',
					message: error.response.data.message || error.message,
					color: 'red',
					icon: <X />,
				});
			}
		}

		try {
			if (!chainId || !entryId) {
				return notifications.show({
					title: 'Error',
					message: 'Chain ID or Anime ID is missing',
					color: 'red',
					icon: <X />,
				});
			}

			const response = await axios.post(
				route('admin.createEntryInAnimeChain'),
				{
					chain_id: chainId,
					anime_id: entryId,
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
		<Drawer
			opened={opened}
			onClose={close}
			title='Add New Chain Entry'
			position='right'
			size={'40rem'}
		>
			<Stack>
				<Stack>
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
							<Stack>
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

								{!isCreatingNewChain && (
									<>
										{chainIdsAndNames.length > 0 && (
											<Select
												label='Select Chain'
												placeholder='Choose a chain to add entry'
												data={chainIdsAndNames.map((chain) => ({
													value: chain.id,
													label: `id: ${chain.id} - name: ${chain.name}`,
												}))}
												clearable
												value={selectedChainId}
												onChange={(value) => {
													setSelectedChainId(value);
													if (value) {
														setIsCreatingNewChain(false);
														setNewChainName('');
													}
												}}
											/>
										)}

										{!selectedChainId && (
											<Stack>
												<Text ta='center'>OR</Text>
												<Button
													variant='outline'
													onClick={() => {
														setIsCreatingNewChain(true);
														setSelectedChainId(null);
													}}
												>
													Create new chain
												</Button>
											</Stack>
										)}
									</>
								)}

								{isCreatingNewChain && (
									<>
										<TextInput
											placeholder='Enter new chain name'
											value={newChainName}
											onChange={(event) =>
												setNewChainName(event.currentTarget.value)
											}
											autoFocus
											rightSection={
												<CloseButton
													aria-label='Clear input'
													onClick={() => {
														setNewChainName('');
														setIsCreatingNewChain(false);
													}}
													style={{ display: undefined }}
												/>
											}
										/>
									</>
								)}

								<Divider />

								<Button
									disabled={animeResult && animeResult.map_id !== null}
									onClick={() =>
										handleAddChainEntry(
											mapId,
											Boolean(isCreatingNewChain),
											newChainName ?? null,
											selectedChainId ? parseInt(selectedChainId) : undefined,
											animeResult.id
										)
									}
								>
									{animeResult && animeResult.map_id !== null
										? 'Cannot Add because it already exists in an anime map'
										: `Add as chain entry`}
								</Button>
							</Stack>
						</Card>
					)}
				</Stack>
			</Stack>
		</Drawer>
	);
}
