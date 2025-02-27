import { Box, Button, Flex, Group, Select, rem } from "@mantine/core";
import { ArrowUpIcon, ArrowDownIcon, FilterIcon } from "lucide-react";
import {
    useAnimeCollectionStore,
    SORT_FIELDS,
    PER_PAGE_OPTIONS,
} from "@/Components/AnimeCollection/store/animeCollectionStore";

/**
 * Component for filtering and sorting anime collections
 */
export function CollectionFilters() {
    const {
        sortField,
        sortDirection,
        perPage,
        setSortField,
        setSortDirection,
        setPerPage,
        resetFilters,
        applyFilters,
    } = useAnimeCollectionStore();

    // Handle sort direction toggle
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        applyFilters();
    };

    // Handle sort field change
    const handleSortFieldChange = (value: string | null) => {
        if (value) {
            setSortField(value);
            applyFilters();
        }
    };

    // Handle per page change
    const handlePerPageChange = (value: string | null) => {
        if (value) {
            setPerPage(Number(value));
            applyFilters(1); // Reset to first page when changing items per page
        }
    };

    // Handle reset filters
    const handleReset = () => {
        resetFilters();
        applyFilters(1);
    };

    return (
        <Box mb="md">
            <Flex
                gap="md"
                direction={{ base: "column", sm: "row" }}
                align={{ sm: "flex-end" }}
            >
                {/* Sorting controls */}
                <Box style={{ minWidth: rem(200) }}>
                    <Select
                        label="Sort by"
                        placeholder="Select field"
                        value={sortField}
                        onChange={handleSortFieldChange}
                        data={SORT_FIELDS}
                        leftSection={<FilterIcon size={16} />}
                    />
                </Box>

                <Button
                    variant="outline"
                    onClick={toggleSortDirection}
                    leftSection={
                        sortDirection === "asc" ? (
                            <ArrowUpIcon size={16} />
                        ) : (
                            <ArrowDownIcon size={16} />
                        )
                    }
                >
                    {sortDirection === "asc" ? "Ascending" : "Descending"}
                </Button>

                {/* Items per page */}
                <Box style={{ minWidth: rem(100) }}>
                    <Select
                        label="Items per page"
                        value={String(perPage)}
                        onChange={handlePerPageChange}
                        data={PER_PAGE_OPTIONS.map((option) => ({
                            value: String(option.value),
                            label: option.label,
                        }))}
                    />
                </Box>

                {/* Reset button */}
                <Button variant="subtle" color="gray" onClick={handleReset}>
                    Reset Filters
                </Button>
            </Flex>
        </Box>
    );
}
