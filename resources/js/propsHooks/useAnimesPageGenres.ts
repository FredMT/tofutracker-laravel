import { useTypedPageProps } from './useTypedPageProps';

type Show = {
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
	shows: Show[];
};

export function useAnimesPageGenres() {
	const props = useTypedPageProps();
	return (props.genres as unknown as Genre[] | null) ?? [];
}
