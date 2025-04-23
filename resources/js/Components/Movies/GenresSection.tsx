import { GenresSkeleton } from '@/Components/Animes/GenresSkeleton';
import { useMoviesPageGenres } from '@/propsHooks/useMoviesPageGenres';
import { Deferred } from '@inertiajs/react';
import { MovieGenresCarousels } from './MovieGenresCarousels';

export function GenresSection() {
	const genres = useMoviesPageGenres();

	return (
		<div className='space-y-4'>
			<Deferred
				data='genres'
				fallback={<GenresSkeleton />}
			>
				<MovieGenresCarousels genresProp={genres} />
			</Deferred>
		</div>
	);
}
