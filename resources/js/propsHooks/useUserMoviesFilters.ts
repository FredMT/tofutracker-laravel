import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Filters } from "@/types/userMovies";

export function useUserMoviesFilters() {
	const props = useTypedPageProps();
	return props.filters as unknown as Filters;
}