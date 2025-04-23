import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

type Trailer = {
	id: number;
	title: string;
	video_key: string;
	video_name: string;
};

export function useAnimesPageTrailers() {
	const props = useTypedPageProps();
	return (props.trailers as unknown as Trailer[] | null) ?? [];
}
