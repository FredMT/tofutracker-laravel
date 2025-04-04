import { ChainEntriesTable } from '@/Components/Admin/AnimeCollection/ChainEntriesTable';
import { ChainData, ChainEntry } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { AddNewChainEntryDrawer } from './AddNewChainEntryDrawer';
import { useDisclosure } from '@mantine/hooks';
import { ChainReorderSheet } from './ChainReorderSheet';
import { RenameChainButton } from './RenameChainButton';
import { useState } from 'react';
import { ChainEntryOrderDrawer } from './ChainEntryOrderDrawer';

export function ChainEntriesSection({
	chainEntries,
	mapId,
}: {
	chainEntries: Record<string, ChainData>;
	mapId: number;
}) {
	const [addEntryOpened, { open: openAddEntry, close: closeAddEntry }] =
		useDisclosure(false);
	const [
		orderDrawerOpened,
		{ open: openOrderDrawer, close: closeOrderDrawer },
	] = useDisclosure(false);
	const [editingChainId, setEditingChainId] = useState<string | null>(null);

	const chainIdsAndNames = Object.entries(chainEntries).map(([id, data]) => ({
		id,
		name: data.name,
	}));

	if (!chainEntries || Object.keys(chainEntries).length === 0) {
		return (
			<>
				<AddNewChainEntryDrawer
					opened={addEntryOpened}
					close={closeAddEntry}
					chainIdsAndNames={chainIdsAndNames}
					mapId={mapId}
				/>
				<Button onClick={openAddEntry}>No chain entries found.</Button>
			</>
		);
	}

	const sortedChainEntries = Object.entries(chainEntries).sort(
		([, a], [, b]) => a.importance_order - b.importance_order
	);

	const handleOpenOrderDrawer = (chainId: string) => {
		setEditingChainId(chainId);
		openOrderDrawer();
	};

	const handleCloseOrderDrawer = () => {
		setEditingChainId(null);
		closeOrderDrawer();
	};

	const editingChainData = editingChainId ? chainEntries[editingChainId] : null;

	return (
		<Stack>
			<Group
				justify='space-between'
				align='center'
			>
				<Title order={3}>Chain Entries</Title>
				<ChainReorderSheet
					chainEntries={chainEntries}
					mapId={mapId}
				/>
			</Group>
			{sortedChainEntries.map(([chainId, chainData]) => (
				<Box
					ml={40}
					key={chainId}
				>
					<Group align='center'>
						<Title order={4}>{chainData.name || `Chain ${chainId}`}</Title>
						<RenameChainButton
							chainId={chainId}
							initialName={chainData.name || `Chain ${chainId}`}
						/>
						<Button
							size='xs'
							variant='outline'
							onClick={() => handleOpenOrderDrawer(chainId)}
						>
							Edit Order
						</Button>
					</Group>
					<ChainEntriesTable
						entries={chainData.entries}
						chainIdsAndNames={chainIdsAndNames}
						mapId={mapId}
					/>
				</Box>
			))}
			{editingChainData && editingChainId && (
				<ChainEntryOrderDrawer
					opened={orderDrawerOpened}
					close={handleCloseOrderDrawer}
					entries={editingChainData.entries}
					chainName={editingChainData.name || `Chain ${editingChainId}`}
				/>
			)}
		</Stack>
	);
}
