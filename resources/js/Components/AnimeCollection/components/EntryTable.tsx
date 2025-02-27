import { DataTable } from "mantine-datatable";
import { AnimeCollectionEntry } from "../types/animeCollections";
import { EntryRow } from "./EntryRow";

interface EntryTableProps {
    entries: AnimeCollectionEntry[];
}

/**
 * Component to display a table of anime entries
 */
export function EntryTable({ entries }: EntryTableProps) {
    const { columns } = EntryRow();

    return (
        <DataTable
            noHeader
            withColumnBorders
            highlightOnHover
            columns={columns}
            records={entries}
            // Add key to fix React warning
            idAccessor="entry_id"
        />
    );
}
