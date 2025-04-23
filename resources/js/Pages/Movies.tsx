import MediaBanner from '@/Components/Common/MediaBanner';
import PopularMoviesCarousel from '@/Components/Movies/PopularMoviesCarousel';
import NowPlayingMoviesCarousel from '@/Components/Movies/NowPlayingMoviesCarousel';
import TopRatedMoviesCarousel from '@/Components/Movies/TopRatedMoviesCarousel';
import UpcomingMoviesCarousel from '@/Components/Movies/UpcomingMoviesCarousel';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { useMoviesPagePopular } from '@/propsHooks/useMoviesPagePopular';
import { Head } from '@inertiajs/react';
import { Space } from '@mantine/core';

function Movies() {
	const popularMovies = useMoviesPagePopular();

	return (
		<>
			<Head title='Movies' />
			<Space h={64} />
			<MediaBanner
				items={popularMovies}
				type='movie'
			/>
			<Space h={64} />
			<PopularMoviesCarousel />
			<Space h={48} />
			<NowPlayingMoviesCarousel />
			<Space h={48} />
			<TopRatedMoviesCarousel />
			<Space h={48} />
			<UpcomingMoviesCarousel />
			<Space h='xl' />
		</>
	);
}

Movies.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Movies;
