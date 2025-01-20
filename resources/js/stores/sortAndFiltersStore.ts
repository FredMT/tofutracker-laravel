import { create } from "zustand";
import { router } from "@inertiajs/react";

interface SortAndFiltersStore {
    sortBy: string;
    sortDirection: "asc" | "desc";
    selectedGenre: string | null;
    minRating: string | null;
    released: string | null;
    search: string | null;
    setSortBy: (value: string) => void;
    setSortDirection: (direction: "asc" | "desc") => void;
    setSelectedGenre: (genre: string | null) => void;
    setMinRating: (rating: string | null) => void;
    setReleased: (released: string | null) => void;
    setSearch: (search: string | null) => void;
    updateUrlAndNavigate: () => void;
}

export const useSortAndFiltersStore = create<SortAndFiltersStore>(
    (set, get) => {
        // Initialize from URL
        const params = new URLSearchParams(window.location.search);
        const sortParam = params.get("sort");
        const directionParam = params.get("direction");
        const genreParam = params.get("genre");
        const ratingParam = params.get("rating");
        const releasedParam = params.get("released");
        const searchParam = params.get("search");

        const validSortOptions = [
            "sort_order",
            "rating",
            "alphabetical",
            "year",
            "date_added",
            "updated_at",
        ];

        return {
            sortBy: validSortOptions.includes(sortParam || "")
                ? sortParam!
                : "sort_order",
            sortDirection: directionParam === "desc" ? "desc" : "asc",
            selectedGenre: genreParam,
            minRating: ratingParam,
            released: releasedParam,
            search: searchParam,
            setSortBy: (value) => set({ sortBy: value }),
            setSortDirection: (direction) => set({ sortDirection: direction }),
            setSelectedGenre: (genre) => set({ selectedGenre: genre }),
            setMinRating: (rating) => set({ minRating: rating }),
            setReleased: (released) => set({ released }),
            setSearch: (search) => set({ search }),
            updateUrlAndNavigate: () => {
                const {
                    sortBy,
                    sortDirection,
                    selectedGenre,
                    minRating,
                    released,
                    search,
                } = get();
                const url = new URL(window.location.href);

                const params = [
                    { key: "sort", value: sortBy, defaultValue: "sort_order" },
                    {
                        key: "direction",
                        value: sortDirection,
                        alwaysInclude: true,
                    },
                    { key: "genre", value: selectedGenre, defaultValue: "any" },
                    { key: "rating", value: minRating, defaultValue: "any" },
                    { key: "released", value: released, defaultValue: "any" },
                    { key: "search", value: search, defaultValue: "" },
                ];

                params.forEach(
                    ({ key, value, defaultValue, alwaysInclude }) => {
                        if (alwaysInclude) {
                            url.searchParams.set(key, value);
                        } else if (value && value !== defaultValue) {
                            url.searchParams.set(key, value);
                        } else {
                            url.searchParams.delete(key);
                        }
                    }
                );

                router.get(
                    url.pathname + url.search,
                    {},
                    { preserveScroll: true, preserveState: true }
                );
            },
        };
    }
);
