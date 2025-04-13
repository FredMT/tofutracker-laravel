import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface Show {
	id: number;
	title: string;
	logo: string;
	backdrop: string;
	overview: string;
	poster: string;
	year: string;
	genres: string[];
	rating: string;
}

export function useShowsPageTrendingData() {
	const props = useTypedPageProps();
	return props.shows as unknown as Show[];
}
