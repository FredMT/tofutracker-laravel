import {ApplyFiltersButton} from "@/Components/UserProfile/Filter/ApplyFiltersButton";
import {ClearFilters} from "@/Components/UserProfile/Filter/ClearFilters";
import {DateRangeFilter} from "@/Components/UserProfile/Filter/DateRangeFilter";
import {FilterWatchStatusSelect} from "@/Components/UserProfile/Filter/FilterWatchStatusSelect";
import {GenreFilter} from "@/Components/UserProfile/Filter/GenreFilter";
import {useFilterStore} from "@/stores/filterStore";
import {Stack, Title} from "@mantine/core";
import {useMemo} from "react";

function FilterDesktop() {
    const { status, fromDate, toDate, genres, title } = useFilterStore();

    const showClearFilters = useMemo(
        () =>
            Boolean(status || fromDate || toDate || genres.length > 0 || title),
        [status, fromDate, toDate, genres.length, title]
    );

    return (
        <Stack px={12} py={12} gap={12}>
            <Title order={2} tt="uppercase" c="dimmed">
                Filters
            </Title>
            <FilterWatchStatusSelect />
            <DateRangeFilter />
            <Stack gap={4}>
                <Title order={6}>Genres</Title>
                <GenreFilter />
            </Stack>
            <ApplyFiltersButton />
            {showClearFilters && <ClearFilters />}
        </Stack>
    );
}

export default FilterDesktop;
