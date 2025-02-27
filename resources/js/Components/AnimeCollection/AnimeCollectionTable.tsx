import { DataTable } from "mantine-datatable";
import { AnimeCollection } from "./types/animeCollections";
import { EmptyState } from "./components/EmptyState";
import { CollectionRow } from "./components/CollectionRow";
import { CollectionContent } from "./components/CollectionContent";
import { useExpanded } from "./hooks/useExpanded";

interface AnimeCollectionTableProps {
    collections: AnimeCollection[];
}

/**
 * Main component for displaying anime collections in a nested table
 */
export function AnimeCollectionTable({
    collections,
}: AnimeCollectionTableProps) {
    const {
        expandedCollectionIds,
        setExpandedCollectionIds,
        expandedChainIds,
        setExpandedChainIds,
    } = useExpanded();

    // Handle empty collections
    if (!collections || collections.length === 0) {
        return <EmptyState />;
    }

    const { columns } = CollectionRow({ expandedCollectionIds });

    return (
        <DataTable
            withTableBorder
            withColumnBorders
            highlightOnHover
            columns={columns}
            records={collections}
            // Add key to fix React warning
            idAccessor="id"
            rowExpansion={{
                allowMultiple: true,
                expanded: {
                    recordIds: expandedCollectionIds,
                    onRecordIdsChange: setExpandedCollectionIds,
                },
                content: (collection) => (
                    <CollectionContent
                        collection={collection.record}
                        expandedChainIds={expandedChainIds}
                        setExpandedChainIds={setExpandedChainIds}
                    />
                ),
            }}
        />
    );
}
