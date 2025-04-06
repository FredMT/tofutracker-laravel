import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { UserData } from "@/types/userData";

export function useUserData() {
	const props = useTypedPageProps();
	return props.userData as unknown as UserData;
}