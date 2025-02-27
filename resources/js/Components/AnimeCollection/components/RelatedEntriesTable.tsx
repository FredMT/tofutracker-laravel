import { Box, Text } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { AnimeRelatedEntry } from "../types/animeCollections";
import { RelatedEntryRow } from "./RelatedEntryRow";

interface RelatedEntriesTableProps {
    entries: AnimeRelatedEntry[];
    hasChains: boolean;
}

/**
 * Component to display a table of related anime entries
 */
export function RelatedEntriesTable({
    entries,
    hasChains,
}: RelatedEntriesTableProps) {
    if (entries.length === 0) return null;

    const { columns } = RelatedEntryRow();

    return (
        <Box mt={hasChains ? "md" : 0}>
            <Text fw={700} mb="xs">
                Related Entries
            </Text>
            <DataTable
                noHeader
                withColumnBorders
                highlightOnHover
                columns={columns}
                records={entries}
                // Add key to fix React warning
                idAccessor="related_entry_id"
            />
        </Box>
    );
}
