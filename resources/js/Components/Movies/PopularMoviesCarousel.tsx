import MediaCarousel from '@/Components/Common/MediaCarousel';
import { useMoviesPagePopular } from '@/propsHooks/useMoviesPagePopular';
import { Container, Stack, Title } from '@mantine/core';

const PopularMoviesCarousel = () => {
	const popularMovies = useMoviesPagePopular();

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<MediaCarousel
				items={popularMovies}
				mediaType='movie'
				title='TOP 20'
				subtitle={['MOVIES', 'THIS WEEK']}
			/>
		</Container>
	);
};

export default PopularMoviesCarousel;
