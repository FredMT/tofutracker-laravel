import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { DailySchedule, TypeCounts } from "@/types/schedule";

type ScheduleData = {
	schedule: DailySchedule[];
	counts: TypeCounts;
};

export function useSchedulePageData() {
	const props = useTypedPageProps();
	return props.data as unknown as ScheduleData;
}