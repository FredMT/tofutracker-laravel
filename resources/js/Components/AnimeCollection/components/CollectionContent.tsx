import { Box } from "@mantine/core";
import { AnimeCollection } from "../types/animeCollections";
import { ChainTable } from "./ChainTable";
import { RelatedEntriesTable } from "./RelatedEntriesTable";
import { Dispatch, SetStateAction } from "react";

interface CollectionContentProps {
	collection: AnimeCollection;
	expandedChainIds: number[];
	setExpandedChainIds: Dispatch<SetStateAction<number[]>>;
}

export function CollectionContent({
																		collection,
																		expandedChainIds,
																		setExpandedChainIds,
																	}: CollectionContentProps) {
	return (
		<Box p="xs">
			<ChainTable
				chains={collection.chains}
				expandedChainIds={expandedChainIds}
				setExpandedChainIds={setExpandedChainIds}
			/>

			<RelatedEntriesTable
				entries={collection.related_entries}
				hasChains={collection.chains.length > 0}
			/>
		</Box>
	);
}
