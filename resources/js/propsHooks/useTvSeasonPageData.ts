import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { TvSeason } from '@/types';

export function useTvSeasonPageData() {
	const props = useTypedPageProps();
	return props.data as unknown as TvSeason;
}
