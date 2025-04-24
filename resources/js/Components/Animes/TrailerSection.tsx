import { useAnimesPageTrailers } from '@/propsHooks/useAnimesPageTrailers';
import { Deferred } from '@inertiajs/react';
import TrailerList from './TrailerList';
import { TrailerSkeleton } from './TrailerSkeleton';

const TrailerSection = () => {
	const trailers = useAnimesPageTrailers();
	return (
		<Deferred
			data='trailers'
			fallback={<TrailerSkeleton />}
		>
			<TrailerList trailers={trailers} />
		</Deferred>
	);
};

export default TrailerSection;
