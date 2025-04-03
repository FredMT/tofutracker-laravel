import { ChainEntry } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { Button, Group, Image, Table } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AddNewChainEntryDrawer } from './AddNewChainEntryDrawer';
import { ChainEntryDeleteButton } from './ChainEntryDeleteButton';
import { MovePopoverButton } from './MovePopoverButton';

export function ChainEntriesTable({
	entries,
	chainIdsAndNames,
	mapId,
}: {
	entries: ChainEntry[];
	chainIdsAndNames: { id: string; name: string }[];
	mapId: number;
}) {
	const [opened, { open, close }] = useDisclosure(false);

	const rows = entries.map((entry) => (
		<Table.Tr key={entry.id}>
			<Table.Td>{entry.sequence_order}</Table.Td>
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
					<MovePopoverButton
						animeId={entry.anime_id}
						chainId={entry.id}
					/>
					<ChainEntryDeleteButton
						entry={entry}
						mapId={mapId}
					/>
				</Group>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<>
			<AddNewChainEntryDrawer
				opened={opened}
				close={close}
				chainIdsAndNames={chainIdsAndNames}
				mapId={mapId}
			/>
			<Table
				striped
				highlightOnHover
				withTableBorder
				withColumnBorders
				miw={400}
			>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>Order</Table.Th>
						<Table.Th>Picture</Table.Th>
						<Table.Th>Title</Table.Th>
						<Table.Th>Actions</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
				<Table.Tfoot>
					<Table.Tr>
						<Table.Td
							colSpan={4}
							py={20}
						>
							<Group justify='center'>
								<Button
									size='xs'
									onClick={open}
								>
									Add new chain entry
								</Button>
							</Group>
						</Table.Td>
					</Table.Tr>
				</Table.Tfoot>
			</Table>
		</>
	);
}
