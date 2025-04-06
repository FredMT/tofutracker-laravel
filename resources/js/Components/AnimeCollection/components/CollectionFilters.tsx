import { Box, Button, Flex, rem, Select } from "@mantine/core";
import { PER_PAGE_OPTIONS, useAnimeCollectionStore } from "@/Components/AnimeCollection/store/animeCollectionStore";
import { useEffect, useState } from "react";
import { SearchComponent } from "@/Components/AnimeCollection/components/SearchComponent";
import { SortingControls } from "@/Components/AnimeCollection/components/SortingControls";
import { ToggleSortDirection } from "@/Components/AnimeCollection/components/ToggleSortDirection";

export function CollectionFilters() {
	const {
		search,
		sortField,
		sortDirection,
		perPage,
		setSearch,
		setSortField,
		setSortDirection,
		setPerPage,
		resetFilters,
		applyFilters,
		hasActiveFilters,
	} = useAnimeCollectionStore();

	const [localSearch, setLocalSearch] = useState(search);

	useEffect(() => {
		setLocalSearch(search);
	}, [search]);

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(localSearch);
		applyFilters(1);
	};

	const toggleSortDirection = () => {
		setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		applyFilters();
	};

	const handleSortFieldChange = (value: string | null) => {
		if (value) {
			setSortField(value);
			applyFilters();
		}
	};

	const handlePerPageChange = (value: string | null) => {
		if (value) {
			setPerPage(Number(value));
			applyFilters(1);
		}
	};

	const handleReset = () => {
		if (hasActiveFilters()) {
			resetFilters();
			setLocalSearch("");
		}
	};

	const filtersActive = hasActiveFilters();

	return (
		<Box mb="md">
			<Flex
				gap="md"
				direction={{ base: "column", sm: "row" }}
				align={{ sm: "flex-end" }}
			>
				<SearchComponent onSubmit={handleSearchSubmit} value={localSearch} onChange={(e) =>
					setLocalSearch(e.currentTarget.value)} />

				<SortingControls value={sortField} onChange={handleSortFieldChange} />

				<ToggleSortDirection onClick={toggleSortDirection} sortDirection={sortDirection} />

				<Box style={{ minWidth: rem(100) }}>
					<Select
						label="Items per page"
						value={String(perPage)}
						onChange={handlePerPageChange}
						data={PER_PAGE_OPTIONS.map((option) => ({
							value: String(option.value),
							label: option.label,
						}))}
					/>
				</Box>

				<Button
					variant="subtle"
					color="gray"
					onClick={handleReset}
					disabled={!filtersActive}
				>
					Reset Filters
				</Button>
			</Flex>
		</Box>
	);
}
