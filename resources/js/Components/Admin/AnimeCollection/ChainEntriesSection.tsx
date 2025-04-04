import { ChainEntriesTable } from '@/Components/Admin/AnimeCollection/ChainEntriesTable';
import { ChainData } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { AddNewChainEntryDrawer } from './AddNewChainEntryDrawer';
import { useDisclosure } from '@mantine/hooks';
import { ChainReorderSheet } from './ChainReorderSheet';
import { RenameChainButton } from './RenameChainButton';

export function ChainEntriesSection({
	chainEntries,
	mapId,
}: {
	chainEntries: Record<string, ChainData>;
	mapId: number;
}) {
	const [opened, { open, close }] = useDisclosure(false);
	const chainIdsAndNames = Object.entries(chainEntries).map(([id, data]) => ({
		id,
		name: data.name,
	}));

	if (!chainEntries || Object.keys(chainEntries).length === 0) {
		return (
			<>
				<AddNewChainEntryDrawer
					opened={opened}
					close={close}
					chainIdsAndNames={chainIdsAndNames}
					mapId={mapId}
				/>
				<Button onClick={open}>No chain entries found.</Button>
			</>
		);
	}

	const sortedChainEntries = Object.entries(chainEntries).sort(
		([, a], [, b]) => a.importance_order - b.importance_order
	);

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
							mapId={mapId}
							chainId={chainId}
							initialName={chainData.name || `Chain ${chainId}`}
						/>
					</Group>
					<ChainEntriesTable
						entries={chainData.entries}
						chainIdsAndNames={chainIdsAndNames}
						mapId={mapId}
					/>
				</Box>
			))}
		</Stack>
	);
}
