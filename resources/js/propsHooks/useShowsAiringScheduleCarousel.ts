import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

interface ScheduleItem {
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

export function useShowsAiringScheduleCarousel() {
	const props = useTypedPageProps();
	return props.airingShows as unknown as ScheduleItem[];
}
