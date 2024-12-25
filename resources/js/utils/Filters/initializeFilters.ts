import { Filters } from "@/types/userMovies";

export const initializeFilters = (
    filters: Partial<Filters> | undefined,
    setFilters: {
        setStatus: (status: string | null) => void;
        setTitle: (title: string | null) => void;
        setDateRange: (range: [Date | null, Date | null]) => void;
        setGenres: (genres: number[]) => void;
    }
) => {
    if (!filters) return;

    if (filters.status) {
        setFilters.setStatus(filters.status);
    }

    if (filters.title) {
        setFilters.setTitle(filters.title);
    }

    setFilters.setDateRange([
        filters.from_date ? new Date(filters.from_date) : null,
        filters.to_date ? new Date(filters.to_date) : null,
    ]);

    if (filters.genres) {
        setFilters.setGenres(filters.genres.split(",").map(Number));
    }
};
