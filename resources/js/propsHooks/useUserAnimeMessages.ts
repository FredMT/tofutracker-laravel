import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

export function useUserAnimeMessages() {
	const props = useTypedPageProps();
	return props.messages as unknown as string[];
}