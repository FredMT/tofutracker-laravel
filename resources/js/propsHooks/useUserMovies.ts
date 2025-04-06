import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Movies } from "@/types/userMovies";

export function useUserMovies() {
	const props = useTypedPageProps();
	return props.movies as unknown as Movies;
}