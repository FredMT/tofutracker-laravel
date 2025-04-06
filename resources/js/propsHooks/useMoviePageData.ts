import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Movie } from "@/types";

export function useMoviePageData() {
	const props = useTypedPageProps();
	return props.data as unknown as Movie;
}