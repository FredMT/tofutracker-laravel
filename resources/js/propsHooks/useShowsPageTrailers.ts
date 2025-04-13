import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

type Trailer = {
	id: string | number;
	videoId: string;
	showName: string;
	videoTitle: string;
	showId: number | null;
	publishedAt: number;
};

export function useShowsPageTrailers() {
	const props = useTypedPageProps();
	return (props.trailers as unknown as Trailer[] | null) ?? [];
}
