import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface Anime {
	id: number;
	title: string;
	poster: string;
	year: string;
	rating: string;
}

export function useAnimesPageAiring() {
	const props = useTypedPageProps();
	return props.airingNow as unknown as Anime[];
}
