import { useAnimeCollectionStore } from "@/Components/AnimeCollection/store/animeCollectionStore";

/**
 * Initializes the filter store state from current URL parameters
 * This should be called on component mount to ensure store state matches URL state
 */
export function initializeStoreFromUrl(): void {
    // Get current URL parameters
    const params = new URLSearchParams(window.location.search);
    const store = useAnimeCollectionStore.getState();

    // Update store values if URL parameters exist
    const search = params.get("search");
    const sort = params.get("sort");
    const direction = params.get("direction") as "asc" | "desc" | null;
    const perPage = params.get("per_page");

    if (search !== null && search !== store.search) {
        store.setSearch(search);
    }

    if (sort !== null && sort !== store.sortField) {
        store.setSortField(sort);
    }

    if (direction !== null && direction !== store.sortDirection) {
        store.setSortDirection(direction);
    }

    if (perPage !== null) {
        const perPageNumber = Number(perPage);
        if (!isNaN(perPageNumber) && perPageNumber !== store.perPage) {
            store.setPerPage(perPageNumber);
        }
    }
}
