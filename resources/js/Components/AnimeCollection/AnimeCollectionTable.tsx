import React from "react";
import { Table, Text, Box } from "@mantine/core";
import { AnimeCollection } from "./types/animeCollections";
import { EmptyState } from "./components/EmptyState";
import { CollectionRow } from "./components/CollectionRow";
import { CollectionContent } from "./components/CollectionContent";
import { useExpanded } from "./hooks/useExpanded";
import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import classes from "./AnimeCollectionTable.module.css";

// Define a column type to handle the width property
interface TableColumn {
    accessor: string;
    title: string;
    width?: number;
    render?: (record: any) => React.ReactNode;
}

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
        isCollectionExpanded,
    } = useExpanded();

    // Handle empty collections
    if (!collections || collections.length === 0) {
        return <EmptyState />;
    }

    const { columns } = CollectionRow({ expandedCollectionIds });

    // Toggle row expansion
    const toggleRowExpansion = (id: number) => {
        setExpandedCollectionIds((current) =>
            current.includes(id)
                ? current.filter((collectionId) => collectionId !== id)
                : [...current, id]
        );
    };

    return (
        <Table.ScrollContainer minWidth={800}>
            <Table withTableBorder withColumnBorders tabularNums>
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
                    {collections.map((collection) => (
                        <React.Fragment key={`fragment-${collection.id}`}>
                            <Table.Tr
                                key={collection.id}
                                onClick={() =>
                                    toggleRowExpansion(collection.id)
                                }
                                style={{ cursor: "pointer" }}
                            >
                                {columns.map((column) => (
                                    <Table.Td
                                        key={`${collection.id}-${column.accessor}`}
                                    >
                                        {column.render
                                            ? column.render(collection)
                                            : null}
                                    </Table.Td>
                                ))}
                            </Table.Tr>
                            {isCollectionExpanded(collection.id) && (
                                <Table.Tr key={`expanded-${collection.id}`}>
                                    <Table.Td colSpan={columns.length} p={0}>
                                        <CollectionContent
                                            collection={collection}
                                            expandedChainIds={expandedChainIds}
                                            setExpandedChainIds={
                                                setExpandedChainIds
                                            }
                                        />
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </React.Fragment>
                    ))}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
}
