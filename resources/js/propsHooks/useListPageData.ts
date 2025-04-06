import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";
import { ListPage } from "@/types/listPage";

export function useListPageData() {
	const props = useTypedPageProps();
	return props.list as unknown as ListPage;
}