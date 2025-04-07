import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { Anime } from '@/types/anime';

export function useAnimeContent() {
	const props = useTypedPageProps();
	return props.data as unknown as Anime;
}
