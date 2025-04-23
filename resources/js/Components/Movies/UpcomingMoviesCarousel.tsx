import MediaCarousel from '@/Components/Common/MediaCarousel';
import { useMoviesPageUpcoming } from '@/propsHooks/useMoviesPageUpcoming';
import { Stack, Title } from '@mantine/core';
import { Container } from '@mantine/core';

const UpcomingMoviesCarousel = () => {
	const upcomingMovies = useMoviesPageUpcoming();

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Stack>
				<Title pl={60}>Upcoming Movies</Title>
				<MediaCarousel
					items={upcomingMovies}
					mediaType='movie'
				/>
			</Stack>
		</Container>
	);
};

export default UpcomingMoviesCarousel;
