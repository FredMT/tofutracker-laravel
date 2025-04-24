import { Text } from '@mantine/core';

export interface TypeCounts {
	tv: number;
	anime: number;
	formatted_start_date?: string;
	formatted_end_date?: string;
}

export function formatScheduleCountSummary(counts: TypeCounts): JSX.Element {
	const parts: JSX.Element[] = [];

	if (counts.tv > 0) {
		parts.push(
			<Text
				key='tv'
				span
				fw={700}
			>
				{`${counts.tv} shows`}
			</Text>
		);
	}

	if (counts.anime > 0) {
		if (parts.length > 0) {
			parts.push(
				<Text
					key='and1'
					span
				>
					{' and '}
				</Text>
			);
		}
		parts.push(
			<Text
				key='anime'
				span
				fw={700}
			>
				{`${counts.anime} anime`}
			</Text>
		);
	}

	if (parts.length === 0) {
		return (
			<Text>
				No scheduled shows or anime airing between{' '}
				<Text
					span
					fw={700}
				>
					{counts.formatted_start_date}
				</Text>{' '}
				and{' '}
				<Text
					span
					fw={700}
				>
					{counts.formatted_end_date}
				</Text>
			</Text>
		);
	}

	return (
		<Text>
			{parts} <Text span>airing between </Text>
			<Text
				span
				fw={700}
			>
				{counts.formatted_start_date}
			</Text>
			<Text span> and </Text>
			<Text
				span
				fw={700}
			>
				{counts.formatted_end_date}
			</Text>
		</Text>
	);
}
