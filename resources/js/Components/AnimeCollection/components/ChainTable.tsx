import React from "react";
import { Table } from "@mantine/core";
import { Dispatch, SetStateAction } from "react";
import { AnimeCollectionChain } from "../types/animeCollections";
import { ChainRow } from "./ChainRow";
import { EntryTable } from "./EntryTable";

// Define a column type to handle the width property
interface TableColumn {
    accessor: string;
    title: string;
    width?: number;
    render?: (record: any) => React.ReactNode;
}

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

    // Toggle row expansion
    const toggleRowExpansion = (id: number) => {
        setExpandedChainIds((current) =>
            current.includes(id)
                ? current.filter((chainId) => chainId !== id)
                : [...current, id]
        );
    };

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
                {chains.map((chain) => (
                    <React.Fragment key={`fragment-${chain.id}`}>
                        <Table.Tr
                            key={chain.id}
                            onClick={() => toggleRowExpansion(chain.id)}
                            style={{ cursor: "pointer" }}
                        >
                            {columns.map((column) => (
                                <Table.Td
                                    key={`${chain.id}-${column.accessor}`}
                                >
                                    {column.render
                                        ? column.render(chain)
                                        : null}
                                </Table.Td>
                            ))}
                        </Table.Tr>
                        {expandedChainIds.includes(chain.id) && (
                            <Table.Tr key={`expanded-${chain.id}`}>
                                <Table.Td colSpan={columns.length} p={0}>
                                    <EntryTable entries={chain.entries} />
                                </Table.Td>
                            </Table.Tr>
                        )}
                    </React.Fragment>
                ))}
            </Table.Tbody>
        </Table>
    );
}
