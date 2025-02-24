import { create } from "zustand";
import { router } from "@inertiajs/react";
import dayjs from "dayjs";

interface FilterState {
    status: string | null;
    title: string | null;
    fromDate: Date | null;
    toDate: Date | null;
    genres: number[];

    // State setters
    setStatus: (status: string | null) => void;
    setTitle: (title: string | null) => void;
    setDateRange: (range: [Date | null, Date | null]) => void;
    setGenres: (genres: number[]) => void;

    // Filter operations
    hasActiveFilters: () => boolean;
    hasUrlFilters: (filters: any) => boolean;
    hasFilterChanges: (filters: any) => boolean;
    applyFilters: (username: string, contentType: string) => void;
    clearFilters: (username: string, contentType: string) => void;
    initializeFromFilters: (filters: any) => void;
}

export const useFilterStore = create<FilterState>((set, get) => ({
    status: null,
    title: null,
    fromDate: null,
    toDate: null,
    genres: [],

    setStatus: (status) => set({ status }),
    setTitle: (title) => set({ title }),
    setDateRange: ([fromDate, toDate]) => set({ fromDate, toDate }),
    setGenres: (genres) => set({ genres }),

    hasActiveFilters: () => {
        const state = get();
        return Boolean(
            state.title ||
                state.genres.length > 0 ||
                state.status ||
                state.fromDate ||
                state.toDate
        );
    },

    hasUrlFilters: (filters) => {
        return Boolean(
            filters.title ||
                filters.genres ||
                filters.status ||
                filters.from_date ||
                filters.to_date
        );
    },

    hasFilterChanges: (filters) => {
        const state = get();
        return (
            state.title !== (filters.title || null) ||
            state.status !== (filters.status || null) ||
            state.genres.join(",") !== (filters.genres || "") ||
            dayjs(state.fromDate).format("YYYY-MM-DD") !==
                (filters.from_date || "") ||
            dayjs(state.toDate).format("YYYY-MM-DD") !== (filters.to_date || "")
        );
    },

    applyFilters: (username, contentType) => {
        const state = get();
        const params = new URLSearchParams();

        if (state.title) params.append("title", state.title);
        if (state.genres.length > 0)
            params.append("genres", state.genres.join(","));
        if (state.status) params.append("status", state.status);
        if (state.fromDate)
            params.append(
                "from_date",
                dayjs(state.fromDate).format("YYYY-MM-DD")
            );
        if (state.toDate)
            params.append("to_date", dayjs(state.toDate).format("YYYY-MM-DD"));

        router.get(
            `/user/${username}/${contentType}`,
            Object.fromEntries(params),
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    },

    clearFilters: (username, contentType) => {
        set({
            status: null,
            title: null,
            fromDate: null,
            toDate: null,
            genres: [],
        });

        router.get(
            `/user/${username}/${contentType}`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    },

    initializeFromFilters: (filters) => {
        if (!filters) return;

        set({
            status: filters.status || null,
            title: filters.title || null,
            fromDate: filters.from_date ? new Date(filters.from_date) : null,
            toDate: filters.to_date ? new Date(filters.to_date) : null,
            genres: filters.genres ? filters.genres.split(",").map(Number) : [],
        });
    },
}));
