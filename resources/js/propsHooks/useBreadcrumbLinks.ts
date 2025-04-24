import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { Links } from '@/types';

export function useBreadcrumbLinks() {
	const props = useTypedPageProps();
	return props.links as unknown as Links;
}
