import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

export interface ScheduleItem {
	id: number;
	title: string;
	episode_date: number;
	episode_number: number;
	episode_name?: string;
	season_number?: number;
	backdrop?: string;
	logo?: string;
	link?: string;
	type: 'tv' | 'anime';
}

export interface ScheduleData {
	counts: TypeCounts;
	schedules: ScheduleItem[];
	success: boolean;
}

export interface TypeCounts {
	tv: number;
	anime: number;
	formatted_start_date?: string;
	formatted_end_date?: string;
}

export function useSchedulePageData() {
	const props = useTypedPageProps();
	return {
		data: props.data as unknown as ScheduleData,
	};
}
