import { GenreConfig } from '@/Components/Shows/components/genresConfig';

export type BackendShow = {
	id: number;
	title: string;
	poster: string;
	rating: string;
	year: number;
};

export type BackendGenre = {
	name: string;
	shows: BackendShow[];
};

export type TransformedShow = Omit<BackendShow, 'id' | 'year' | 'rating'> & {
	id: string;
	year: string;
	rating: string;
};

export type MergedGenre = Omit<BackendGenre, 'shows'> &
	GenreConfig & {
		id: string;
		shows: TransformedShow[];
	};

export type GenresCarouselsProps = {
	genresProp: { genres: BackendGenre[] } | BackendGenre[];
};
