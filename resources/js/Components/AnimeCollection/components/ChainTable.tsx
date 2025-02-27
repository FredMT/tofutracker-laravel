import { DataTable } from "mantine-datatable";
import { Dispatch, SetStateAction } from "react";
import { AnimeCollectionChain } from "../types/animeCollections";
import { ChainRow } from "./ChainRow";
import { EntryTable } from "./EntryTable";

interface ChainTableProps {
    chains: AnimeCollectionChain[];
    expandedChainIds: number[];
    setExpandedChainIds: Dispatch<SetStateAction<number[]>>;
}

/**
 * Component to display a table of anime chains
 */
export function ChainTable({
    chains,
    expandedChainIds,
    setExpandedChainIds,
}: ChainTableProps) {
    if (chains.length === 0) return null;

    const { columns } = ChainRow({ expandedChainIds });

    return (
        <DataTable
            noHeader
            withColumnBorders
            highlightOnHover
            columns={columns}
            records={chains}
            // Add key to fix React warning
            idAccessor="id"
            rowExpansion={{
                allowMultiple: true,
                expanded: {
                    recordIds: expandedChainIds,
                    onRecordIdsChange: setExpandedChainIds,
                },
                content: (chain) => (
                    <EntryTable entries={chain.record.entries} />
                ),
            }}
        />
    );
}
