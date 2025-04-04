import { router } from '@inertiajs/react';
import {
	Button,
	CloseButton,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

type Chain = {
	id: number;
	map_id: number;
	name: string;
	importance_order: number;
	created_at: string;
	updated_at: string;
};

type Collection = {
	id: number;
	created_at: string | null;
	updated_at: string;
	most_common_tmdb_id: number;
	tmdb_type: 'tv' | 'movie';
	collection_name: string;
	chains: Chain[];
};

const searchMapSchema = z.number().min(1);
const newChainNameSchema = (existingChains: string[]) =>
	z.string().refine((name) => !existingChains.includes(name), {
		message: 'Chain name must be unique',
	});

interface ExistingMapTabContentProps {
	animeId: number;
	chainId: number;
}

export function ExistingMapTabContent({
	animeId,
	chainId,
}: ExistingMapTabContentProps) {
	const [searchMap, setSearchMap] = useState('');
	const [animeMap, setAnimeMap] = useState<Collection | null>(null);
	const [newChainName, setNewChainName] = useState('');
	const [selectedChain, setSelectedChain] = useState<string | null>(null);

	async function findAnimeMap() {
		try {
			const parsedMapId = searchMapSchema.parse(Number(searchMap));
			const response = await axios.get(
				route('admin.findMapByMapId', { animeMap: parsedMapId })
			);

			setAnimeMap(response.data.animeMap);
		} catch (error: any) {
			console.log(error);
			notifications.show({
				title: 'Error',
				message: 'Error retrieving data',
				color: 'red',
				icon: <X />,
			});
		}
	}

	const isSearchMapValid = () => {
		const parsedValue = Number(searchMap);
		return searchMapSchema.safeParse(parsedValue).success;
	};

	const isNewChainNameValid = () => {
		if (!animeMap) return true;
		const existingChainNames = animeMap.chains.map((chain) => chain.name);
		return newChainNameSchema(existingChainNames).safeParse(newChainName)
			.success;
	};

	async function moveChainEntryToNewChain() {
		if (!animeMap)
			return notifications.show({
				title: 'Error',
				message: 'Anime Map ID not found',
				color: 'red',
				icon: <X />,
			});

		try {
			const response = await axios.post(
				route('admin.moveChainEntryToNewChain', {
					animeMap: animeMap.id,
					chainEntry: chainId,
					anime: animeId,
				}),
				{
					chain_name: newChainName,
				}
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			if (response.data.redirect === true) {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.redirectMapId,
					})
				);
			} else {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.refreshMapId,
					})
				);
			}
		} catch (error: any) {
			console.error(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}

	async function moveFromChainToRelated() {
		if (!animeMap)
			return notifications.show({
				title: 'Error',
				message: 'Anime Map ID not found',
				color: 'red',
				icon: <X />,
			});

		try {
			const response = await axios.post(
				route('admin.moveFromChainToRelated', {
					animeMap: animeMap.id,
					chainEntry: chainId,
					anime: animeId,
				})
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			if (response.data.redirect === true) {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.redirectMapId,
					})
				);
			} else {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.refreshMapId,
					})
				);
			}
		} catch (error: any) {
			console.error(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}

	async function moveAnimeToChain() {
		try {
			const response = await axios.post(
				route('admin.moveChainEntryToAnotherChain', {
					chainEntry: chainId,
					anime: animeId,
				}),
				{
					move_chain_id: selectedChain,
				}
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			if (response.data.redirect === true) {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.redirectMapId,
					})
				);
			} else {
				router.visit(
					route('admin.showAdminAnimeCollectionPage', {
						animeMap: response.data.refreshMapId,
					})
				);
			}
		} catch (error: any) {
			console.error(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}

	return (
		<Stack>
			<Group align='flex-end'>
				<TextInput
					placeholder='Search existing Map ID'
					label='Existing Map ID'
					value={searchMap}
					onChange={(event) => setSearchMap(event.currentTarget.value)}
					rightSectionPointerEvents='all'
					mt='md'
					rightSection={
						<CloseButton
							aria-label='Clear input'
							onClick={() => {
								setSearchMap('');
								setAnimeMap(null);
							}}
							style={{ display: searchMap ? undefined : 'none' }}
						/>
					}
				/>
				<Button
					onClick={findAnimeMap}
					disabled={!isSearchMapValid()}
				>
					Search existing map
				</Button>
			</Group>

			{animeMap && (
				<>
					<Stack>
						<Select
							label='Select a Chain'
							placeholder='Choose a chain'
							data={animeMap.chains.map((chain) => ({
								value: chain.id.toString(),
								label: chain.name,
							}))}
							value={selectedChain}
							onChange={setSelectedChain}
							clearable
						/>
						{selectedChain && (
							<Button
								onClick={moveAnimeToChain}
								color='blue'
							>
								Move To Selected Chain
							</Button>
						)}
					</Stack>
					<Text ta='center'>OR</Text>

					<TextInput
						label='Create a new chain'
						placeholder='New Chain Name'
						value={newChainName}
						onChange={(event) => setNewChainName(event.currentTarget.value)}
						rightSection={
							<CloseButton
								aria-label='Clear input'
								onClick={() => {
									setNewChainName('');
								}}
								style={{ display: newChainName ? undefined : 'none' }}
							/>
						}
					/>
					<Button
						onClick={moveChainEntryToNewChain}
						disabled={!newChainName.trim() || !isNewChainNameValid()}
					>
						Create New Chain
					</Button>

					<Text ta='center'>OR</Text>

					<Button
						onClick={moveFromChainToRelated}
						color='green'
					>
						Create New Related Entry
					</Button>
				</>
			)}
		</Stack>
	);
}
