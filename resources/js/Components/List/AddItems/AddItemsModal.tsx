import {
    Drawer,
    Modal,
    Stack,
    TextInput,
    Loader,
    Group,
    Text,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery, useFetch } from "@mantine/hooks";
import { useAddItemsStore } from "@/stores/addItemsStore";
import { CompactSearchResultItem } from "./CompactSearchResultItem";
import { ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import { SearchResponse } from "@/types/quickSearch";
import { Link } from "@inertiajs/react";

interface AddItemsModalProps {
    listId: number;
}

export function AddItemsModal({ listId }: AddItemsModalProps) {
    const isMobile = useMediaQuery("(max-width: 48em)");
    const { isOpen, setIsOpen, query, setQuery } = useAddItemsStore();
    const [debouncedQuery] = useDebouncedValue(query, 150);
    const [addedItems, setAddedItems] = useState<Set<number>>(new Set());

    const { data, loading, error } = useFetch<SearchResponse>(
        debouncedQuery
            ? route("quicksearch", {
                  q: debouncedQuery,
                  max_results: 10,
              })
            : ""
    );

    const results = data?.results || {};

    const handleItemAdded = (id: number) => {
        setAddedItems((prev) => new Set([...prev, id]));
    };

    const content = (
        <Stack gap="md">
            <TextInput
                placeholder="Search for movies, TV shows, or anime..."
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
                leftSection={<Search size={16} />}
                rightSection={loading && <Loader size="xs" />}
                mt={8}
            />
            <Stack gap="xs">
                {error ? (
                    <Text c="red">
                        Error loading results. Please try again.
                    </Text>
                ) : Object.values(results).length > 0 ? (
                    <>
                        {Object.values(results).map((result) => (
                            <CompactSearchResultItem
                                key={`${result.media_type}-${result.id}`}
                                {...result}
                                listId={listId}
                                onItemAdded={handleItemAdded}
                                isBeingAdded={addedItems.has(result.id)}
                            />
                        ))}
                        {query && (
                            <Link
                                href={route("search", { q: query })}
                                style={{
                                    textDecoration: "none",
                                    color: "inherit",
                                }}
                            >
                                <Group justify="space-between" p="xs">
                                    <Text size="sm">View all results</Text>
                                    <ArrowRight size={16} />
                                </Group>
                            </Link>
                        )}
                    </>
                ) : (
                    query && <Text>No results found</Text>
                )}
            </Stack>
        </Stack>
    );

    if (isMobile) {
        return (
            <Drawer
                opened={isOpen}
                onClose={() => setIsOpen(false)}
                title="Add Items"
                position="bottom"
                size="90%"
            >
                {content}
            </Drawer>
        );
    }

    return (
        <Modal
            opened={isOpen}
            onClose={() => setIsOpen(false)}
            title="Add Items"
            size="lg"
            centered
        >
            {content}
        </Modal>
    );
}
