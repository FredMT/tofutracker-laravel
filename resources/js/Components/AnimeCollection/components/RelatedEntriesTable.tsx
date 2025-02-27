import { Box, Text, Table } from "@mantine/core";
import { AnimeRelatedEntry } from "../types/animeCollections";
import { RelatedEntryRow } from "./RelatedEntryRow";

// Define a column type to handle the width property
interface TableColumn {
    accessor: string;
    title: string;
    width?: number;
    render?: (record: any) => React.ReactNode;
}

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
            <Table
                withColumnBorders
                withTableBorder
                highlightOnHover
                tabularNums
            >
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
                        <Table.Tr key={entry.related_entry_id}>
                            {columns.map((column) => (
                                <Table.Td
                                    key={`${entry.related_entry_id}-${column.accessor}`}
                                >
                                    {column.render
                                        ? column.render(entry)
                                        : null}
                                </Table.Td>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Box>
    );
}
