import { useTypedPageProps } from './useTypedPageProps';

type Show = {
	id: number;
	title: string;
	poster: string;
	rating: string;
	year: number;
};

type Genre = {
	name: string;
	shows: Show[];
};

type GenreList = {
	genres: Genre[];
};

export function useShowsPageGenres() {
	const props = useTypedPageProps();
	return (props.genres as unknown as GenreList | null) ?? [];
}
