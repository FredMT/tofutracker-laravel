import { Auth } from "@/types";
import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

export function useAuth() {
	const auth = useTypedPageProps();
	return auth as unknown as Auth;
}
