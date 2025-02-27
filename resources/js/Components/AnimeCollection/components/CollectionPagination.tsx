import { Group, Pagination, Text, Loader, Flex } from "@mantine/core";
import { PaginationMeta } from "../types/animeCollections";
import { useCallback } from "react";

interface CollectionPaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

/**
 * Component to handle pagination for anime collections
 */
export function CollectionPagination({
    meta,
    onPageChange,
    isLoading = false,
}: CollectionPaginationProps) {
    const handlePageChange = useCallback(
        (page: number) => {
            onPageChange(page);
        },
        [onPageChange]
    );

    const message = `Showing ${meta.from} – ${meta.to} of ${meta.total}`;

    return (
        <Group justify="space-between" align="center" mt="md">
            {isLoading ? (
                <Flex gap="xs" align="center">
                    <Loader size="xs" />
                    <Text size="sm" c="dimmed" span>
                        Loading...
                    </Text>
                </Flex>
            ) : (
                <Text size="sm" c="dimmed">
                    {message}
                </Text>
            )}
            <Pagination
                total={meta.last_page}
                value={meta.current_page}
                onChange={handlePageChange}
                withEdges
                siblings={1}
                boundaries={1}
                disabled={isLoading}
            />
        </Group>
    );
}
