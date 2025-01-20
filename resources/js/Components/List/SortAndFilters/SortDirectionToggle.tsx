import { ActionIcon, Tooltip } from "@mantine/core";
import { ArrowDownToDot, ArrowUpFromDot } from "lucide-react";
import { useSortAndFiltersStore } from "@/stores/sortAndFiltersStore";

export default function SortDirectionToggle() {
    const { sortDirection, setSortDirection, updateUrlAndNavigate } =
        useSortAndFiltersStore();
    const isAscending = sortDirection === "asc";

    const toggleSortDirection = () => {
        setSortDirection(isAscending ? "desc" : "asc");
        updateUrlAndNavigate();
    };

    return (
        <Tooltip label="Sort direction">
            <ActionIcon
                variant="subtle"
                size="lg"
                onClick={toggleSortDirection}
                aria-label={isAscending ? "Sort descending" : "Sort ascending"}
            >
                {isAscending ? (
                    <ArrowUpFromDot size={20} />
                ) : (
                    <ArrowDownToDot size={20} />
                )}
            </ActionIcon>
        </Tooltip>
    );
}
