import { MediaItem } from "@/types/search";
import SearchResult from "./SearchResult";
import { SimpleGrid, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

interface SearchResultsListProps {
    items: MediaItem[];
    type: "movies" | "tv" | "anime";
}

export default function SearchResultsList({
    items,
    type,
}: SearchResultsListProps) {
    const isMobile = useMediaQuery("(max-width: 600px)");

    if (isMobile) {
        return (
            <SimpleGrid
                type="container"
                cols={{
                    base: 2,
                    "400px": 3,
                    "600px": 4,
                }}
                spacing={{ base: "xs", "400px": "md" }}
            >
                {items.map((item) => (
                    <SearchResult
                        key={item.id}
                        item={item}
                        type={type}
                        variant="card"
                    />
                ))}
            </SimpleGrid>
        );
    }

    return (
        <Stack gap="md">
            {items.map((item) => (
                <SearchResult
                    key={item.id}
                    item={item}
                    type={type}
                    variant="list"
                />
            ))}
        </Stack>
    );
}
