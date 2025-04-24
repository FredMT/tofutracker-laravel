import MediaBanner from '@/Components/Common/MediaBanner';
import MediaCarousel from '@/Components/Common/MediaCarousel';
import { GenresSection } from '@/Components/Movies/GenresSection';
import ResponsiveContainer from '@/Components/ResponsiveContainer';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import { useMoviesPageNowPlaying } from '@/propsHooks/useMoviesPageNowPlaying';
import { useMoviesPagePopular } from '@/propsHooks/useMoviesPagePopular';
import { useMoviesPageTopRated } from '@/propsHooks/useMoviesPageTopRated';
import { useMoviesPageUpcoming } from '@/propsHooks/useMoviesPageUpcoming';
import { Head } from '@inertiajs/react';
import { Space, Stack, Title } from '@mantine/core';

function Movies() {
	const popularMovies = useMoviesPagePopular();
	const nowPlayingMovies = useMoviesPageNowPlaying();
	const topRatedMovies = useMoviesPageTopRated();
	const upcomingMovies = useMoviesPageUpcoming();

	return (
		<>
			<Head title='Movies' />
			<Space h={64} />
			<MediaBanner
				items={popularMovies}
				type='movie'
			/>
			<Space h={64} />
			<ResponsiveContainer>
				<MediaCarousel
					items={popularMovies}
					mediaType='movie'
					title='TOP 20'
					subtitle={['MOVIES', 'THIS WEEK']}
				/>
				<Space h={48} />
				<Stack>
					<Title pl={60}>Now Playing</Title>
					<MediaCarousel
						items={nowPlayingMovies}
						mediaType='movie'
					/>
				</Stack>
				<Space h={48} />
				<GenresSection />
				<Space h={48} />
				<Stack>
					<Title pl={60}>Top Rated</Title>
					<MediaCarousel
						items={topRatedMovies}
						mediaType='movie'
					/>
				</Stack>
				<Space h={48} />
				<Stack>
					<Title pl={60}>Upcoming Movies</Title>
					<MediaCarousel
						items={upcomingMovies}
						mediaType='movie'
					/>
				</Stack>
				<Space h='xl' />
			</ResponsiveContainer>
		</>
	);
}

Movies.layout = (page: any) => (
	<AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Movies;
