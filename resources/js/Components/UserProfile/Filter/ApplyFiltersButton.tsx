import {useFilterStore} from "@/stores/filterStore";
import {PageProps} from "@/types/userMovies";
import {applyFilters} from "@/utils/Filters/applyFilters";
import {usePage} from "@inertiajs/react";
import {Button} from "@mantine/core";

interface ApplyFiltersButtonProps {
    onApply?: () => void;
}

export function ApplyFiltersButton({ onApply }: ApplyFiltersButtonProps) {
    const { userData } = usePage<PageProps>().props;
    const { status, fromDate, toDate, genres } = useFilterStore();

    const hasFiltersExceptSearch = Boolean(
        status || fromDate || toDate || genres.length > 0
    );

    const handleApply = () => {
        applyFilters(userData.username, useFilterStore.getState(), {
            preserveScroll: true,
            close: onApply,
        });
    };

    return (
        <Button
            fullWidth
            onClick={handleApply}
            disabled={!hasFiltersExceptSearch}
            mt={20}
        >
            Apply Filters
        </Button>
    );
}
