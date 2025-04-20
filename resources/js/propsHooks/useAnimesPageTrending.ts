import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface Anime {
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

export function useAnimesPageTrending() {
	const props = useTypedPageProps();
	return props.trending as unknown as Anime[];
}
