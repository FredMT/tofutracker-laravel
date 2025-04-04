import { router } from '@inertiajs/react';
import {
	Button,
	CloseButton,
	Divider,
	Drawer,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
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

interface MoveFromRelatedEntryDrawerButtonProps {
	relatedEntryId?: number;
}

export function MoveFromRelatedEntryDrawerButton({
	relatedEntryId,
}: MoveFromRelatedEntryDrawerButtonProps) {
	const [opened, { open, close }] = useDisclosure(false);
	const [searchMap, setSearchMap] = useState('');
	const [animeMap, setAnimeMap] = useState<Collection | null>(null);
	const [selectedChain, setSelectedChain] = useState<string | null>(null);

	const isSearchMapValid = () => {
		const parsedValue = Number(searchMap);
		return searchMapSchema.safeParse(parsedValue).success;
	};

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

	async function moveFromRelatedToChain() {
		if (!relatedEntryId || !selectedChain) {
			return notifications.show({
				title: 'Error',
				message:
					'Ensure both related entry id exists and selected anime chain id exists',
				color: 'red',
				icon: <X />,
			});
		}
		try {
			const response = await axios.post(
				route('admin.moveFromRelatedToChain', {
					relatedEntry: relatedEntryId,
					chain: selectedChain,
				})
			);

			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			router.reload();
		} catch (error: any) {
			console.error(error);
			notifications.show({
				title: 'Error',
				message: error.response.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
			router.reload();
		}
	}

	return (
		<>
			<Drawer
				opened={opened}
				onClose={close}
				title='Move From Related Entry'
				position='right'
				size='40rem'
			>
				<Stack>
					{' '}
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
								<Divider />
								<Title
									order={3}
									ta='center'
								>
									Move to existing chain
								</Title>
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
										onClick={moveFromRelatedToChain}
										color='blue'
									>
										Move To Selected Chain
									</Button>
								)}
							</Stack>
							<Text ta='center'>OR</Text>
						</>
					)}
				</Stack>
			</Drawer>
			<Button
				color='violet'
				onClick={open}
			>
				Move
			</Button>
		</>
	);
}
