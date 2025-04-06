import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Anime } from "@/types/anime";

export function useAnimePageData() {
	const props = useTypedPageProps();
	return props.data as unknown as Anime;
}