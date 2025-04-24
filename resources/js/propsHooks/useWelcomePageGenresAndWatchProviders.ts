import { useTypedPageProps } from '@/propsHooks/useTypedPageProps';
import { GenresAndWatchProvidersHomepage } from '@/types/genresandwatchprovidershomepage';

export function useWelcomePageGenresAndWatchProviders() {
	const props = useTypedPageProps();
	return props.genresandwatchproviders as unknown as GenresAndWatchProvidersHomepage;
}
