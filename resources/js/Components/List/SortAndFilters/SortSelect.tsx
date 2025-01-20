import { Select } from "@mantine/core";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";

const sortOptions = [
    { label: "Sort order", value: "sort_order" },
    { label: "Rating", value: "rating" },
    { label: "Alphabetical", value: "alphabetical" },
    { label: "Release Year", value: "year" },
    { label: "Date Added", value: "date_added" },
    { label: "Latest Updated", value: "updated_at" },
];

function SortSelect() {
    const { sortBy, setSortBy, updateUrlAndNavigate } =
        useSortAndFiltersStore();

    const handleChange = (value: string | null) => {
        setSortBy(value || "sort_order");
        updateUrlAndNavigate();
    };

    return (
        <Select
            label="Sort by"
            value={sortBy}
            onChange={handleChange}
            data={sortOptions}
            w={150}
            clearable={sortBy !== "sort_order"}
            searchable
            allowDeselect={false}
            clearButtonProps={{
                "aria-label": "Clear sort",
            }}
        />
    );
}

export default SortSelect;
