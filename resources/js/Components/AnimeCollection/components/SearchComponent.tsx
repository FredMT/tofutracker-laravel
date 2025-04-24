import { Box, TextInput } from '@mantine/core';
import { SearchIcon } from 'lucide-react';

export function SearchComponent(props: {
	onSubmit: (e: React.FormEvent) => void;
	value: string;
	onChange: (e) => void;
}) {
	return (
		<Box style={{ flexGrow: 1 }}>
			<form onSubmit={props.onSubmit}>
				<TextInput
					label='Search anime - Press Enter to search'
					placeholder='Search TMDB for anime...'
					value={props.value}
					onChange={props.onChange}
					leftSection={<SearchIcon size={16} />}
				/>
			</form>
		</Box>
	);
}
