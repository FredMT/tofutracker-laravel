import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { UserCustomList } from '@/types/userCustomLists';

export function useUserCustomList() {
	const props = useTypedPageProps();
	return props.list as unknown as UserCustomList;
}
