import MediaCarousel from '@/Components/Common/MediaCarousel';
import { useMoviesPageTopRated } from '@/propsHooks/useMoviesPageTopRated';
import { Stack, Title } from '@mantine/core';
import { Container } from '@mantine/core';

const TopRatedMoviesCarousel = () => {
	const topRatedMovies = useMoviesPageTopRated();

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Stack>
				<Title pl={60}>Top Rated</Title>
				<MediaCarousel
					items={topRatedMovies}
					mediaType='movie'
				/>
			</Stack>
		</Container>
	);
};

export default TopRatedMoviesCarousel;
