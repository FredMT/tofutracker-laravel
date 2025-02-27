import {
    Box,
    Button,
    Flex,
    Group,
    Select,
    TextInput,
    rem,
} from "@mantine/core";
import {
    SearchIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    FilterIcon,
} from "lucide-react";
import {
    useAnimeCollectionStore,
    SORT_FIELDS,
    PER_PAGE_OPTIONS,
} from "@/Components/AnimeCollection/store/animeCollectionStore";
import { useState, useEffect } from "react";

/**
 * Component for filtering and sorting anime collections
 */
export function CollectionFilters() {
    const {
        search,
        sortField,
        sortDirection,
        perPage,
        setSearch,
        setSortField,
        setSortDirection,
        setPerPage,
        resetFilters,
        applyFilters,
    } = useAnimeCollectionStore();

    // Local state for form values (to avoid immediate filtering on each keystroke)
    const [localSearch, setLocalSearch] = useState(search);

    // Update local state when store values change (e.g., on URL changes)
    useEffect(() => {
        setLocalSearch(search);
    }, [search]);

    // Handle search form submission
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(localSearch);
        applyFilters(1); // Reset to first page when searching
    };

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
        setLocalSearch("");
        applyFilters(1);
    };

    return (
        <Box mb="md">
            <Flex
                gap="md"
                direction={{ base: "column", sm: "row" }}
                align={{ sm: "flex-end" }}
            >
                {/* Search input */}
                <Box style={{ flexGrow: 1 }}>
                    <form onSubmit={handleSearchSubmit}>
                        <TextInput
                            label="Search anime - Press Enter to search"
                            placeholder="Search TMDB for anime..."
                            value={localSearch}
                            onChange={(e) =>
                                setLocalSearch(e.currentTarget.value)
                            }
                            leftSection={<SearchIcon size={16} />}
                        />
                    </form>
                </Box>

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
