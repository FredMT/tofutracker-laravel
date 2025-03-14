import { create } from "zustand";
import { router } from "@inertiajs/react";

type FilterType = "tv" | "anime" | null;

interface ScheduleFilterState {
    activeFilter: FilterType;
    setFilter: (filter: FilterType) => void;
    initFromUrl: () => void;
    isTvActive: () => boolean;
    isAnimeActive: () => boolean;
    isFilterActive: () => boolean;
}

export const useScheduleFilterStore = create<ScheduleFilterState>(
    (set, get) => ({
        activeFilter: null,

        setFilter: (filter) => {
            set({ activeFilter: filter });

            const params: Record<string, string> = {};

            if (filter !== null) {
                params.type = filter;
            }

            const searchParams = new URLSearchParams(window.location.search);
            const dateParam = searchParams.get("date");
            if (dateParam) {
                params.date = dateParam;
            }

            router.visit(route("schedule.index", params), {
                preserveState: true,
                preserveScroll: true,
                only: ["data"],
            });
        },

        initFromUrl: () => {
            const searchParams = new URLSearchParams(window.location.search);
            const typeParam = searchParams.get("type");

            if (typeParam === "tv" || typeParam === "anime") {
                set({ activeFilter: typeParam as FilterType });
            } else {
                set({ activeFilter: null });
            }
        },

        isTvActive: () => get().activeFilter === "tv",

        isAnimeActive: () => get().activeFilter === "anime",

        isFilterActive: () => get().activeFilter !== null,
    })
);
