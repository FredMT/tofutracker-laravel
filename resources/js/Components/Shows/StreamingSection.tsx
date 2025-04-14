import { useShowsPageProviders } from '@/propsHooks/useShowsPageProviders';
import { Deferred } from '@inertiajs/react';
import { StreamingCarousel } from './components/StreamingCarousel';
import { StreamingSkeleton } from './components/StreamingSkeleton';

const StreamingSection = () => {
	const providers = useShowsPageProviders();

	return (
		<Deferred
			data='providers'
			fallback={<StreamingSkeleton />}
		>
			<StreamingCarousel providers={providers} />
		</Deferred>
	);
};

export default StreamingSection;
