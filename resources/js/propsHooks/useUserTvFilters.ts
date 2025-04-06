import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { UserTvFilters } from "@/types/userTv";

export function useUserTvFilters() {
	const props = useTypedPageProps();
	return props.filters as unknown as UserTvFilters;
}