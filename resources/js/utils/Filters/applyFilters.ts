import {router} from "@inertiajs/react";

interface FilterState {
    status: string | null;
    title: string | null;
    fromDate: Date | null;
    toDate: Date | null;
    genres: number[];
}

export const applyFilters = (
    username: string,
    filterState: FilterState,
    options?: {
        preserveScroll?: boolean;
        preserveState?: boolean;
        close?: () => void;
    }
) => {
    const newFilters: Record<string, any> = {};

    if (filterState.status) newFilters.status = filterState.status;
    if (filterState.title) newFilters.title = filterState.title;
    if (filterState.fromDate)
        newFilters.from_date = filterState.fromDate.toISOString();
    if (filterState.toDate)
        newFilters.to_date = filterState.toDate.toISOString();
    if (filterState.genres.length > 0)
        newFilters.genres = filterState.genres.join(",");

    router.get(`/user/${username}/movies`, newFilters, {
        preserveState: true,
        preserveScroll: options?.preserveScroll ?? false,
        ...options,
    });

    options?.close?.();
};
