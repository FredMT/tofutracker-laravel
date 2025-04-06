import { create } from "zustand";
import { router } from "@inertiajs/react";

interface AnimeCollectionStore {
	search: string;

	sortField: string;
	sortDirection: "asc" | "desc";

	perPage: number;

	setSearch: (search: string) => void;
	setSortField: (field: string) => void;
	setSortDirection: (direction: "asc" | "desc") => void;
	setPerPage: (perPage: number) => void;
	resetFilters: () => void;
	hasActiveFilters: () => boolean;

	applyFilters: (page?: number) => void;
}

export const SORT_FIELDS = [
	{ value: "id", label: "ID" },
	{ value: "created_at", label: "Date Added" },
	{ value: "updated_at", label: "Last Updated" },
];

export const PER_PAGE_OPTIONS = [
	{ value: 10, label: "10" },
	{ value: 25, label: "25" },
	{ value: 50, label: "50" },
	{ value: 100, label: "100" },
];

const DEFAULT_VALUES = {
	search: "",
	sortField: "id",
	sortDirection: "asc" as const,
	perPage: 25,
};

export const useAnimeCollectionStore = create<AnimeCollectionStore>(
	(set, get) => {
		// Initialize with default values (URL parameters are handled separately on mount)
		return {
			search: DEFAULT_VALUES.search,
			sortField: DEFAULT_VALUES.sortField,
			sortDirection: DEFAULT_VALUES.sortDirection,
			perPage: DEFAULT_VALUES.perPage,

			setSearch: (search) => set({ search }),
			setSortField: (sortField) => set({ sortField }),
			setSortDirection: (sortDirection) => set({ sortDirection }),
			setPerPage: (perPage) => set({ perPage }),

			hasActiveFilters: () => {
				const { search, sortField, sortDirection, perPage } = get();
				return (
					search !== DEFAULT_VALUES.search ||
					sortField !== DEFAULT_VALUES.sortField ||
					sortDirection !== DEFAULT_VALUES.sortDirection ||
					perPage !== DEFAULT_VALUES.perPage
				);
			},

			resetFilters: () => {
				set({
					search: DEFAULT_VALUES.search,
					sortField: DEFAULT_VALUES.sortField,
					sortDirection: DEFAULT_VALUES.sortDirection,
					perPage: DEFAULT_VALUES.perPage,
				});

				router.get(
					route("anime-collections.index"),
					{},
					{
						preserveState: true,
						preserveScroll: true,
					},
				);
			},

			applyFilters: (page = 1) => {
				const { search, sortField, sortDirection, perPage } = get();

				const queryParams: Record<string, any> = { page };

				if (search) queryParams.search = search;
				if (sortField !== DEFAULT_VALUES.sortField)
					queryParams.sort = sortField;
				if (sortDirection !== DEFAULT_VALUES.sortDirection)
					queryParams.direction = sortDirection;
				if (perPage !== DEFAULT_VALUES.perPage)
					queryParams.per_page = perPage;

				router.get(route("anime-collections.index"), queryParams, {
					preserveState: true,
					preserveScroll: true,
				});
			},
		};
	},
);
