export type PersonWatchedStats = {
	movies: {
		watched: number;
		total: number;
		watched_ids: number[] | null;
	};
	shows: {
		watched: number;
		total: number;
		watched_ids: number[] | null;
	};
};

import { useTypedPageProps } from './useTypedPageProps';

export function usePersonWatchedStats() {
	const props = useTypedPageProps();
	return props.watchedStats as unknown as PersonWatchedStats;
}

export function isMediaWatched(
	mediaType: 'movie' | 'tv',
	mediaId: number,
	watchedStats: PersonWatchedStats
) {
	if (!watchedStats) return false;

	if (mediaType === 'movie') {
		return watchedStats.movies.watched_ids?.includes(mediaId) || false;
	} else if (mediaType === 'tv') {
		return watchedStats.shows.watched_ids?.includes(mediaId) || false;
	}

	return false;
}
