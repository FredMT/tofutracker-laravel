import { RingProgress, Text, Stack, Box } from '@mantine/core';
import { Deferred } from '@inertiajs/react';
import {
	PersonWatchedStats,
	usePersonWatchedStats,
} from '@/propsHooks/usePersonWatchedStats';

const WatchedStatsRingSkeleton = () => {
	return (
		<Box>
			<RingProgress
				size={90}
				thickness={8}
				sections={[
					{ value: 0, color: 'gray' },
					{ value: 0, color: 'dimmed' },
				]}
				label={
					<Stack
						align='center'
						gap={0}
					>
						<Text
							fw={700}
							ta='center'
							size='xs'
						>
							-%
						</Text>
					</Stack>
				}
			/>
		</Box>
	);
};

const WatchedStatsContent = ({ stats }: { stats: PersonWatchedStats }) => {
	const totalItems = stats.movies.total + stats.shows.total + stats.anime.total;
	const totalWatched =
		stats.movies.watched + stats.shows.watched + stats.anime.watched;

	const overallPercentage =
		totalItems > 0 ? Math.round((totalWatched / totalItems) * 100) : 0;

	let moviePercentage = 0;
	let showPercentage = 0;
	let animePercentage = 0;

	if (totalItems > 0) {
		moviePercentage = Math.round(
			(stats.movies.watched / stats.movies.total) * 33
		);
		showPercentage = Math.round((stats.shows.watched / stats.shows.total) * 33);
		animePercentage = Math.round(
			(stats.anime.watched / stats.anime.total) * 33
		);

		if (stats.movies.watched > 0 && moviePercentage === 0) moviePercentage = 1;
		if (stats.shows.watched > 0 && showPercentage === 0) showPercentage = 1;
		if (stats.anime.watched > 0 && animePercentage === 0) animePercentage = 1;
	}

	return (
		<Box>
			<RingProgress
				size={120}
				thickness={12}
				rootColor='gray.3'
				sections={[
					{
						value: moviePercentage,
						color: 'blue',
						tooltip: `Movies: ${stats.movies.watched}/${stats.movies.total}`,
					},
					{
						value: showPercentage,
						color: 'red',
						tooltip: `TV Shows: ${stats.shows.watched}/${stats.shows.total}`,
					},
					{
						value: animePercentage,
						color: 'grape',
						tooltip: `Anime: ${stats.anime.watched}/${stats.anime.total}`,
					},
				]}
				label={
					<Stack
						align='center'
						gap={0}
					>
						<Text
							fw={700}
							ta='center'
							size='xs'
						>
							{overallPercentage}%
						</Text>
					</Stack>
				}
			/>
		</Box>
	);
};

const WatchedStatsRing = () => {
	const personWatchedStats = usePersonWatchedStats();
	return (
		<Deferred
			data='watchedStats'
			fallback={<WatchedStatsRingSkeleton />}
		>
			<WatchedStatsContent stats={personWatchedStats} />
		</Deferred>
	);
};

export default WatchedStatsRing;
