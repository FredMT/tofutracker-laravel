import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { UserCustomLists } from '@/types/userCustomLists';

export function useUserCustomLists() {
	const props = useTypedPageProps();
	return props.userLists as unknown as UserCustomLists;
}
