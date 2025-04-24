import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { AnimeContentDataType } from '@/types';

export function useAnimeContentData() {
	const props = useTypedPageProps();
	return props.data as unknown as AnimeContentDataType;
}
