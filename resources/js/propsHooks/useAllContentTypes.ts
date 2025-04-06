import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { AllContentTypes } from "@/types";

export function useAllContentTypes() {
	const props = useTypedPageProps();
	return props.type as unknown as AllContentTypes;
}