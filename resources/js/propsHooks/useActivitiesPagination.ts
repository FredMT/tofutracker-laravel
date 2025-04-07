import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { PaginationData } from '@/Components/UserProfile/Activity/activityType';

export function useActivitiesPagination() {
	const props = useTypedPageProps();
	return props.activities as unknown as PaginationData;
}
