import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { Movie, TvShow } from '@/types';

type RegularContentDataType = Movie | TvShow;

export function useOnlyMovieAndTvShowData() {
	const props = useTypedPageProps();
	return props.data as unknown as RegularContentDataType;
}
