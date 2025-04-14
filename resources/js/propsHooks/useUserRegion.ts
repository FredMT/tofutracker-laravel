import { Auth } from '@/types';
import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

export function useUserRegion() {
	const props = useTypedPageProps();
	return props.user_region;
}
