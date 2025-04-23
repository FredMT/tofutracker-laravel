import { Deferred } from '@inertiajs/react';
import { useAnimesPageTrailers } from '@/propsHooks/useAnimesPageTrailers';
import { TrailerSkeleton } from './TrailerSkeleton';
import { Title } from '@mantine/core';
import TrailerList from './TrailerList';

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
