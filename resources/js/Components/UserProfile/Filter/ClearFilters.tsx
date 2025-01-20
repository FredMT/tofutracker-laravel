import {useFilterStore} from "@/stores/filterStore";
import {PageProps} from "@/types/userMovies";
import {router, usePage} from "@inertiajs/react";
import {Button} from "@mantine/core";

export function ClearFilters() {
    const { userData } = usePage<PageProps>().props;
    const { clearFilters, hasActiveFilters } = useFilterStore();

    const handleClearFilters = () => {
        clearFilters();
        router.get(
            `/user/${userData.username}/movies`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <Button
            variant="subtle"
            color="red"
            onClick={handleClearFilters}
            fullWidth
            disabled={!hasActiveFilters()}
        >
            Clear All Filters
        </Button>
    );
}
