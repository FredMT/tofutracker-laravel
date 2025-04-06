import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Filters } from "@/types/userAnime";

export function useUserAnimeFilters() {
	const props = useTypedPageProps();
	return props.filters as unknown as Filters;
}