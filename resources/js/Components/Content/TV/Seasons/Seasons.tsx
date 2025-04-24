import { usePage } from '@inertiajs/react';
import AnimeSeasons from './AnimeSeasons';
import RegularSeasons from './RegularSeasons';
import { AllContentTypes } from '@/types';

interface SeasonsProps {
	containerWidth: number;
	slideSize?: string;
}

export default function Seasons({
	containerWidth,
	slideSize = '0%',
}: SeasonsProps) {
	const { type } = usePage<{ type: AllContentTypes }>().props;

	if (type === 'tv') {
		return (
			<RegularSeasons
				containerWidth={containerWidth}
				slideSize={slideSize}
			/>
		);
	}

	if (type === 'animetv') {
		return (
			<AnimeSeasons
				containerWidth={containerWidth}
				slideSize={slideSize}
			/>
		);
	}
}
