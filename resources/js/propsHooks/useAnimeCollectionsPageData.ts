import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { AnimeCollectionsResponse } from "@/Components/AnimeCollection/types/animeCollections";

export function useAnimeCollectionsPageData() {
	const props = useTypedPageProps();
	return props.collections as unknown as AnimeCollectionsResponse;
}