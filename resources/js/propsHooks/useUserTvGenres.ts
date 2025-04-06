import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { UserTvGenre } from "@/types/userTv";

export function useUserTvGenres() {
	const props = useTypedPageProps();
	return props.genres as unknown as UserTvGenre[];
}