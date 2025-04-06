import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { TrendingContent } from "@/types/trending";

export function useTrendingContentData() {
	const props = useTypedPageProps();
	return props.data as unknown as TrendingContent;
}