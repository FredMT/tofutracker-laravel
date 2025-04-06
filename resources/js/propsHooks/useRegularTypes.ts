import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { RegularType } from "@/types";

export function useRegularTypes() {
	const props = useTypedPageProps();
	return props.type as unknown as RegularType;
}