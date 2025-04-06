import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { AnimeSeason } from "@/types/animeseason";

export function useAnimeSeasonPageData() {
	const props = useTypedPageProps();
	return props.data as unknown as AnimeSeason;
}