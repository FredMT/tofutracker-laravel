import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { AnimeCollection } from '@/types/userAnime';

export function useUserAnimeCollections() {
	const props = useTypedPageProps();
	return props.collections as unknown as AnimeCollection[];
}
