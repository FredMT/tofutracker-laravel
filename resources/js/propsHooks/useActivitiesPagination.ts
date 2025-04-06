import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { PaginationData } from "@/Components/UserProfile/Activity/activityType";

export function useActivitiesPagination() {
	const props = useTypedPageProps();
	return props.activities_pagination as unknown as PaginationData;
}