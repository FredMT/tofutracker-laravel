import { Group, TextInput } from "@mantine/core";
import RandomButton from "./RandomButton";

function ListSortAndFiltersSection() {
    return (
        <Group>
            <TextInput placeholder="Search in this list" maw={350} />
            <RandomButton />
        </Group>
    );
}

export default ListSortAndFiltersSection;
