import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface TopRatedMovie {
	id: number;
	title: string;
	poster: string;
	year: string;
	rating: string;
}

export function useMoviesPageTopRated() {
	const props = useTypedPageProps();
	return props.top_rated as unknown as TopRatedMovie[];
}
