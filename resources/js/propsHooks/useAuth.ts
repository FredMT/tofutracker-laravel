import { Auth } from '@/types';
import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

export function useAuth() {
	const props = useTypedPageProps();
	return props.auth as unknown as Auth;
}
