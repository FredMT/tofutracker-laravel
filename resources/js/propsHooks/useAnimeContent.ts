import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { AnimeType } from "@/types";

export function useAnimeContent() {
	const props = useTypedPageProps();
	return props.type as unknown as AnimeType;
}