import { Movie, TvSeason, TvShow } from '@/types';
import { getLanguageName } from '@/utils/formatter';
import { Badge, Group, Paper, Text } from '@mantine/core';
import { useRegularTypes } from '@/propsHooks/useRegularTypes';
import { useRegularContentData } from '@/propsHooks/useRegularContentData';
import { EpisodeCountdown } from './EpisodeCountdown';

export function RegularContentSummary() {
	const type = useRegularTypes();
	const data = useRegularContentData();
	const date =
		type === 'movie'
			? (data as Movie).release_date
			: type === 'tv'
			? (data as TvShow).first_air_date
			: (data as TvSeason).air_date;

	const countdown =
		type === 'movie'
			? null
			: type === 'tv'
			? (data as unknown as TvShow).countdown
			: (data as unknown as TvSeason).countdown;

	return (
		<Paper
			p={16}
			className='border-y-2 border-gray-600 rounded-none'
			radius={0}
		>
			<Group
				wrap='wrap'
				gap={36}
				preventGrowOverflow
			>
				{data.vote_average > 0 && (
					<Badge variant='outline'>{data.vote_average.toFixed(2)}</Badge>
				)}
				{date && <Text>{date}</Text>}
				{data.runtime && <Text>{data.runtime}</Text>}
				{data.original_language && (
					<Text>{getLanguageName(data.original_language)}</Text>
				)}
				{data.certification && <Text>{data.certification}</Text>}
				{type !== 'movie' && countdown && (
					<EpisodeCountdown timestamp={countdown} />
				)}
			</Group>
		</Paper>
	);
}
