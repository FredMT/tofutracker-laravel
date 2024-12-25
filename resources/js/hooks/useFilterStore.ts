import { create } from "zustand";

interface FilterState {
    status: string | null;
    title: string | null;
    fromDate: Date | null;
    toDate: Date | null;
    genres: number[];
    setStatus: (status: string | null) => void;
    setTitle: (title: string | null) => void;
    setDateRange: (range: [Date | null, Date | null]) => void;
    setGenres: (genres: number[]) => void;
    clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
    status: null,
    title: null,
    fromDate: null,
    toDate: null,
    genres: [],
    setStatus: (status) => set({ status }),
    setTitle: (title) => set({ title }),
    setDateRange: ([fromDate, toDate]) => set({ fromDate, toDate }),
    setGenres: (genres) => set({ genres }),
    clearFilters: () =>
        set({
            status: null,
            title: null,
            fromDate: null,
            toDate: null,
            genres: [],
        }),
}));
