import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { RegularContentDataType } from "@/types";

export function useRegularContentData() {
	const props = useTypedPageProps();
	return props.data as unknown as RegularContentDataType;
}