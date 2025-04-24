import { Button } from '@mantine/core';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

export function ToggleSortDirection(props: {
	onClick: () => void;
	sortDirection: 'asc' | 'desc';
}) {
	return (
		<Button
			variant='outline'
			onClick={props.onClick}
			leftSection={
				props.sortDirection === 'asc' ? (
					<ArrowUpIcon size={16} />
				) : (
					<ArrowDownIcon size={16} />
				)
			}
		>
			{props.sortDirection === 'asc' ? 'Ascending' : 'Descending'}
		</Button>
	);
}
