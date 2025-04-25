import { MediaItemProps } from '@/Components/Common/MediaCard';

export interface Credit {
	id: number;
	title: string;
	poster_path?: string | null;
	rating?: number;
	vote_count?: number;
	year?: string;
	character?: string;
	department?: string;
	mediaType: 'movie' | 'tv' | 'anime';
	bayesianRating?: number;
	backdrop_path?: string | null;
	popularity?: number;
	priority?: number;
	original_id?: number;
}

export interface ExternalIds {
	imdb_id: string | null;
	instagram_id: string | null;
	twitter_id: string | null;
}

export const calculateAge = (birthday: string): number | string => {
	if (!birthday) return 'N/A';
	const birthDate = new Date(birthday);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
};

export const formatDate = (dateString: string): string => {
	if (!dateString) return 'N/A';
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	return new Date(dateString).toLocaleDateString('en-US', options);
};

export const calculateBayesianRating = (
	rating: number,
	voteCount: number
): number => {
	const C = 100;
	const M = 6;
	return (voteCount * rating + C * M) / (voteCount + C);
};

export const getMediaItem = (credit: Credit): MediaItemProps => ({
	id: credit.id,
	title: credit.title,
	poster: credit.poster_path || '',
	rating: credit.rating?.toString() || 'N/A',
	year: credit.year || 'TBA',
	mediaType: credit.mediaType || 'movie',
});

export const getTvMediaItem = (credit: Credit): MediaItemProps => ({
	...getMediaItem(credit),
	mediaType: 'tv',
});

export const getAnimeMediaItem = (credit: Credit): MediaItemProps => ({
	...getMediaItem(credit),
	mediaType: 'anime',
});
