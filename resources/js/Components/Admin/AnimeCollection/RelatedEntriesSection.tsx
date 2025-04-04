import { RelatedEntriesNewItemDrawer } from '@/Components/Admin/AnimeCollection/RelatedEntriesNewItemDrawer';
import { router } from '@inertiajs/react';
import {
	Box,
	Button,
	Group,
	Image,
	Modal,
	Stack,
	Table,
	Text,
	Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { InfoIcon, X } from 'lucide-react';
import { useState } from 'react';
import { MoveFromRelatedEntryDrawerButton } from '@/Components/Admin/AnimeCollection/MoveFromRelatedEntryDrawerButton';

type RelatedEntry = {
	id: number;
	anime_id: number;
	picture: string | null;
	title_main: string;
};

export function RelatedEntriesSection({
	relatedEntries,
	mapId,
}: {
	relatedEntries: RelatedEntry[] | [];
	mapId: number;
}) {
	const [opened, { open, close }] = useDisclosure(false);
	const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

	async function handleDeleteRelatedEntry(relatedEntryId: number) {
		try {
			const response = await axios.delete(
				route('admin.deleteItemFromRelatedEntry', {
					relatedEntry: relatedEntryId,
				})
			);
			notifications.show({
				title: 'Success',
				message: response.data.message,
				color: 'green',
				icon: <InfoIcon />,
			});

			router.visit(
				route('admin.showAdminAnimeCollectionPage', {
					animeMap: response.data.redirectMapId,
				})
			);
		} catch (error: any) {
			notifications.show({
				title: 'Error',
				message: error.reponse.data.message || error.message,
				color: 'red',
				icon: <X />,
			});
		}
	}

	// Show message and Add button if no entries
	if (!relatedEntries || relatedEntries.length === 0) {
		return (
			<Stack
				ml={40}
				align='center'
				gap='lg'
			>
				<Text>No related entries found.</Text>
				<RelatedEntriesNewItemDrawer mapId={mapId} />
			</Stack>
		);
	}

	const rows = relatedEntries.map((entry) => (
		<Table.Tr key={entry.id}>
			<Table.Td>
				{entry.picture ? (
					<Image
						src={`https://anidb.net/images/main/${entry.picture}`}
						alt={entry.title_main}
						w={40}
						h='auto'
						radius='sm'
					/>
				) : (
					'-'
				)}
			</Table.Td>
			<Table.Td>
				<Group justify='space-between'>
					{entry.title_main}
					<a
						href={`https://anidb.net/anime/${entry.anime_id}`}
						target='_blank'
					>
						<Button variant='outline'>Visit</Button>
					</a>
				</Group>
			</Table.Td>
			<Table.Td>
				<Group gap='xs'>
					<MoveFromRelatedEntryDrawerButton relatedEntryId={entry.id} />
					<Button
						color='red'
						onClick={() => {
							open();
							setSelectedEntry(entry.id);
						}}
					>
						Delete
					</Button>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			<Modal
				opened={opened}
				onClose={close}
				title='Delete Related Entry ?'
			>
				<Text>
					Are you sure you want to delete this entry from related entries?
				</Text>
				<Group
					justify='self-end'
					mt={20}
				>
					<Button onClick={close}>Cancel</Button>
					{selectedEntry && (
						<Button
							onClick={() => handleDeleteRelatedEntry(selectedEntry)}
							variant='filled'
							color='red'
						>
							Delete
						</Button>
					)}
				</Group>
			</Modal>
			<Stack>
				<Title
					order={3}
					ml={20}
				>
					Related Entries
				</Title>
				<Box ml={40}>
					<Table
						striped
						highlightOnHover
						withTableBorder
						withColumnBorders
						miw={400} // Minimum width
					>
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Picture</Table.Th>
								<Table.Th>Title</Table.Th>
								<Table.Th>Actions</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							{rows}
							<Table.Tr>
								<Table.Td
									colSpan={3}
									py={20}
								>
									<Group justify='center'>
										<RelatedEntriesNewItemDrawer mapId={mapId} />
									</Group>
								</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
				</Box>
			</Stack>
		</>
	);
}
