import React from 'react';
import {
	DiscoverWatchProvider,
	DiscoverWatchProvidersProps,
} from '@/Components/Welcome/DiscoverWatchProvider';

export interface WatchProviderItem {
	id: number;
	anime_id?: number;
	media_type: string;
	title: string;
	release_date: string;
	vote_average: number;
	popularity: number;
	poster_path: string | null;
	backdrop_path: string | null;
}

export interface WatchProviderData {
	provider_name: string;
	provider_logo: string;
	items: WatchProviderItem[];
}

export function DiscoverWatchProviders({
	providers,
}: DiscoverWatchProvidersProps) {
	const [activeProviderId, setActiveProviderId] = React.useState<string>(
		Object.keys(providers)[0] || ''
	);

	const activeProvider = providers[activeProviderId];

	if (!activeProvider) return null;

	return (
		<DiscoverWatchProvider
			providerId={activeProviderId}
			data={activeProvider}
			onProviderChange={setActiveProviderId}
		/>
	);
}

export default DiscoverWatchProviders;
