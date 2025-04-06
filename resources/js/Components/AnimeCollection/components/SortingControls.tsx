import { Box, rem, Select } from "@mantine/core";
import { SORT_FIELDS } from "@/Components/AnimeCollection/store/animeCollectionStore";
import { FilterIcon } from "lucide-react";

export function SortingControls(props: { value: string, onChange: (value: (string | null)) => void }) {
	return <Box style={{ minWidth: rem(200) }}>
		<Select
			label="Sort by"
			placeholder="Select field"
			value={props.value}
			onChange={props.onChange}
			data={SORT_FIELDS}
			leftSection={<FilterIcon size={16} />}
		/>
	</Box>;
}