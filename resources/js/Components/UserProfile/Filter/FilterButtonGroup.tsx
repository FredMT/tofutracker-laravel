import { useFilterStore } from "@/hooks/useFilterStore";
import { Button, Group, Select, Stack } from "@mantine/core";
import { DatesProvider, DatePickerInput } from "@mantine/dates";
import FilterSearchInput from "./FilterSearchInput";
import { useMediaQuery } from "@mantine/hooks";
import { WatchStatusDisplay } from "@/types/enums";
import dayjs from "dayjs";
import { router, usePage } from "@inertiajs/react";
import { PageProps, UserTvGenre } from "@/types/userTv";

interface FilterButtonGroupProps {
    contentType: "movies" | "tv" | "anime";
}

export default function FilterButtonGroup({
    contentType,
}: FilterButtonGroupProps) {
    const { genres, userData, filters, messages, errors } =
        usePage<PageProps>().props;
    const filterStore = useFilterStore();
    const isMobile = useMediaQuery("(max-width: 640px)");

    const hasActiveFilters = Boolean(
        filterStore.title ||
            filterStore.genres.length > 0 ||
            filterStore.status ||
            filterStore.fromDate ||
            filterStore.toDate
    );

    const hasUrlFilters = Boolean(
        filters.title ||
            filters.genres ||
            filters.status ||
            filters.from_date ||
            filters.to_date
    );

    const hasFilterChanges =
        filterStore.title !== (filters.title || null) ||
        filterStore.status !== (filters.status || null) ||
        filterStore.genres.join(",") !== (filters.genres || "") ||
        dayjs(filterStore.fromDate).format("YYYY-MM-DD") !==
            (filters.from_date || "") ||
        dayjs(filterStore.toDate).format("YYYY-MM-DD") !==
            (filters.to_date || "");

    const handleGenreChange = (value: string | null) => {
        filterStore.setGenres(value ? [parseInt(value)] : []);
    };

    const handleWatchStatusChange = (value: string | null) => {
        filterStore.setStatus(value);
    };

    const handleApplyFilters = () => {
        const params = new URLSearchParams();

        if (filterStore.title) {
            params.append("title", filterStore.title);
        }

        if (filterStore.genres.length > 0) {
            params.append("genres", filterStore.genres.join(","));
        }

        if (filterStore.status) {
            params.append("status", filterStore.status);
        }

        if (filterStore.fromDate) {
            params.append(
                "from_date",
                dayjs(filterStore.fromDate).format("YYYY-MM-DD")
            );
        }

        if (filterStore.toDate) {
            params.append(
                "to_date",
                dayjs(filterStore.toDate).format("YYYY-MM-DD")
            );
        }

        router.get(
            `/user/${userData.username}/${contentType}`,
            Object.fromEntries(params)
        );
    };

    const handleClearFilters = () => {
        filterStore.setGenres([]);
        filterStore.setStatus(null);
        filterStore.setDateRange([null, null]);
        filterStore.setTitle(null);

        if (hasUrlFilters) {
            router.get(`/user/${userData.username}/${contentType}`);
        }
    };

    const genreData = genres.map((genre: UserTvGenre) => ({
        value: genre.id.toString(),
        label: genre.name,
    }));

    const watchStatusData = Object.entries(WatchStatusDisplay).map(
        ([key, value]) => ({
            value: key,
            label: value,
        })
    );

    const selectedGenre =
        filterStore.genres.length > 0 ? filterStore.genres[0].toString() : null;

    const filterControls = (
        <Group wrap="wrap">
            <Select
                data={genreData}
                placeholder="Select genre"
                searchable
                nothingFoundMessage="No genres found"
                value={selectedGenre}
                onChange={handleGenreChange}
                clearable
                w={200}
            />

            <Select
                data={watchStatusData}
                placeholder="Select status"
                value={filterStore.status}
                onChange={handleWatchStatusChange}
                clearable
                w={160}
            />

            <DatePickerInput
                type="range"
                allowSingleDateInRange
                value={[filterStore.fromDate, filterStore.toDate]}
                onChange={(range: [Date | null, Date | null]) =>
                    filterStore.setDateRange(range)
                }
                popoverProps={{ withinPortal: false }}
                clearable
                valueFormat="DD MMM YYYY"
                placeholder="Pick dates"
                w={235}
            />
            <Group>
                <Button
                    variant="filled"
                    color="blue"
                    onClick={handleApplyFilters}
                    disabled={!hasActiveFilters || !hasFilterChanges}
                >
                    Apply Filters
                </Button>
                <Button
                    variant="light"
                    color="red"
                    onClick={handleClearFilters}
                    disabled={!hasActiveFilters && !hasUrlFilters}
                >
                    Clear Filters
                </Button>
            </Group>
        </Group>
    );

    return (
        <>
            {isMobile ? (
                <>
                    <FilterSearchInput contentType={contentType} />
                    <DatesProvider settings={{ locale: "en", timezone: "UTC" }}>
                        {filterControls}
                    </DatesProvider>
                </>
            ) : (
                <>
                    <FilterSearchInput contentType={contentType} />
                    <DatesProvider settings={{ locale: "en", timezone: "UTC" }}>
                        {filterControls}
                    </DatesProvider>
                </>
            )}
        </>
    );
}
