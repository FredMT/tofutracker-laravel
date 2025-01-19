import { Group } from "@mantine/core";
import RandomButton from "./RandomButton";
import SortSelect from "./SortSelect";
import SortDirectionToggle from "./SortDirectionToggle";
import GenresSelect from "./GenresSelect";
import RatingSelect from "./RatingSelect";
import ReleasedSelect from "./ReleasedSelect";
import ListSearchFilter from "./ListSearchFilter";
import { ListItemGenre } from "@/types/listPage";

interface ListSortAndFiltersSectionProps {
    listGenres: ListItemGenre[];
}

function ListSortAndFiltersSection({
    listGenres,
}: ListSortAndFiltersSectionProps) {
    return (
        <Group align="flex-end">
            <ListSearchFilter />
            <Group gap="xs" align="flex-end">
                <SortSelect />
                <SortDirectionToggle />
            </Group>
            <GenresSelect listGenres={listGenres} />
            <RatingSelect />
            <ReleasedSelect />

            <RandomButton />
        </Group>
    );
}

export default ListSortAndFiltersSection;
