import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { TvShow } from '@/types';

export function useTvShowPageData() {
	const props = useTypedPageProps();
	return props.data as unknown as TvShow;
}
