import { useTypedPageProps } from './useTypedPageProps';

interface Show {
	id: number;
	name: string | null;
	poster: string;
	rating: number | null;
	year: string | null;
}

interface Provider {
	provider_id: number;
	provider_name: string;
	provider_logo_path: string;
	shows: Show[];
}

export function useShowsPageProviders() {
	const props = useTypedPageProps();
	return (props.providers as unknown as Provider[]) ?? [];
}
