import { useTypedPageProps } from './useTypedPageProps';

type Movie = {
	id: number;
	title: string;
	poster: string;
	rating: string;
	year: number;
	backdrop: string | null;
};

type Genre = {
	id: number;
	name: string;
	movies: Movie[];
};

export function useMoviesPageGenres() {
	const props = useTypedPageProps();
	return (props.genres as unknown as Genre[] | null) ?? [];
}
