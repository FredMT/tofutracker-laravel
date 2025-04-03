import { ChainEntriesTable } from '@/Components/Admin/AnimeCollection/ChainEntriesTable';
import { ChainData } from '@/Pages/Admin/ShowAnimeCollectionPage';
import { Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { AddNewChainEntryDrawer } from './AddNewChainEntryDrawer';
import { useDisclosure } from '@mantine/hooks';

export function ChainEntriesSection({
	chainEntries,
	mapId,
}: {
	chainEntries: Record<string, ChainData> | {};
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

	return (
		<Stack>
			<Group
				justify='space-between'
				align='center'
			>
				<Title order={3}>Chain Entries</Title>
			</Group>
			{Object.entries(chainEntries).map(([chainId, chainData]) => (
				<Box
					ml={40}
					key={chainId}
				>
					<Title
						order={4}
						mb='md'
					>
						{chainData.name || `Chain ${chainId}`}
					</Title>
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
