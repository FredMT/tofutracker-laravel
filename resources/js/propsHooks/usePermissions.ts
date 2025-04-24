import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';

type PermissionsType = {
	is_superuser: boolean;
};

export function usePermissions() {
	const props = useTypedPageProps();
	return props.permissions as unknown as PermissionsType;
}
