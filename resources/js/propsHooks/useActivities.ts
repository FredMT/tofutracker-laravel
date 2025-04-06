import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { Activity } from "@/Components/UserProfile/Activity/activityType";

export function useActivities() {
	const props = useTypedPageProps();
	return props.activities as unknown as Activity[];
}