import {ApplyFiltersButton} from "@/Components/UserProfile/Filter/ApplyFiltersButton";
import {ClearFilters} from "@/Components/UserProfile/Filter/ClearFilters";
import {DateRangeFilter} from "@/Components/UserProfile/Filter/DateRangeFilter";
import {FilterWatchStatusSelect} from "@/Components/UserProfile/Filter/FilterWatchStatusSelect";
import FilterSearchInput from "@/Components/UserProfile/Filter/FilterSearchInput";
import {GenreFilter} from "@/Components/UserProfile/Filter/GenreFilter";
import {useFilterStore} from "@/stores/filterStore";
import {Button, Drawer, Stack, Title} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {useMemo} from "react";

interface FilterMobileDrawerProps {
    contentType: "movies" | "tv";
}

function FilterMobileDrawer({ contentType }: FilterMobileDrawerProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const { status, fromDate, toDate, genres, title } = useFilterStore();

    const showClearFilters = useMemo(
        () =>
            Boolean(status || fromDate || toDate || genres.length > 0 || title),
        [status, fromDate, toDate, genres.length, title]
    );

    return (
        <>
            <Drawer.Root
                opened={opened}
                onClose={close}
                position="bottom"
                radius="md"
                aria-labelledby="Filter Settings"
            >
                <Drawer.Overlay backgroundOpacity={0.5} blur={4} />
                <Drawer.Content>
                    <Drawer.Header>
                        <Drawer.Title fz={"h3"} fw="bold">
                            Filter Settings
                        </Drawer.Title>
                        <Drawer.CloseButton />
                    </Drawer.Header>
                    <Drawer.Body>
                        <Stack>
                            <FilterSearchInput contentType={contentType} />
                            <FilterWatchStatusSelect />
                            <DateRangeFilter placeholder="Select a date range (double click a date for a single date)" />
                            <Stack gap={4}>
                                <Title order={6}>Genres</Title>
                                <GenreFilter />
                            </Stack>
                            <ApplyFiltersButton onApply={close} />
                            {showClearFilters && <ClearFilters />}
                        </Stack>
                    </Drawer.Body>
                </Drawer.Content>
            </Drawer.Root>
            <Button onClick={open} fullWidth>
                Filter
            </Button>
        </>
    );
}

export default FilterMobileDrawer;
