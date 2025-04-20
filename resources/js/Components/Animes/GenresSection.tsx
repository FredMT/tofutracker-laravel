import { AnimeGenresCarousels } from '@/Components/Animes/AnimeGenresCarousels';
import { GenresSkeleton } from '@/Components/Animes/GenresSkeleton';
import { useAnimesPageGenres } from '@/propsHooks/useAnimesPageGenres';
import { Deferred } from '@inertiajs/react';

export function GenresSection() {
	const genres = useAnimesPageGenres();

	return (
		<div className='space-y-4'>
			<Deferred
				data='genres'
				fallback={<GenresSkeleton />}
			>
				<AnimeGenresCarousels genresProp={genres} />
			</Deferred>
		</div>
	);
}
