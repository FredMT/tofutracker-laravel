import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

export interface ScheduleItem {
	id: number;
	title: string;
	episode_date: number;
	episode_number: number;
	episode_name: string;
	backdrop: string | null;
	logo: string | null;
	link: string;
	type: 'anime';
}

export function useShowsAiringScheduleCarousel() {
	const props = useTypedPageProps();
	return props.airingSchedule as unknown as ScheduleItem[];
}
