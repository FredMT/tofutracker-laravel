import { Table } from "@mantine/core";
import { AnimeCollectionEntry } from "../types/animeCollections";
import { EntryRow } from "./EntryRow";

// Define a column type to handle the width property
interface TableColumn {
    accessor: string;
    title: string;
    width?: number;
    render?: (record: any) => React.ReactNode;
}

interface EntryTableProps {
    entries: AnimeCollectionEntry[];
}

/**
 * Component to display a table of anime entries
 */
export function EntryTable({ entries }: EntryTableProps) {
    const { columns } = EntryRow();

    return (
        <Table withColumnBorders withTableBorder highlightOnHover tabularNums>
            <Table.Thead>
                <Table.Tr>
                    {columns.map((column) => (
                        <Table.Th
                            key={column.accessor}
                            style={{
                                width: (column as TableColumn).width
                                    ? `${(column as TableColumn).width}px`
                                    : "auto",
                            }}
                        >
                            {column.title}
                        </Table.Th>
                    ))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {entries.map((entry) => (
                    <Table.Tr key={entry.entry_id}>
                        {columns.map((column) => (
                            <Table.Td
                                key={`${entry.entry_id}-${column.accessor}`}
                            >
                                {column.render ? column.render(entry) : null}
                            </Table.Td>
                        ))}
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}
