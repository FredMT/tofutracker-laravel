import MediaCarousel from '@/Components/Common/MediaCarousel';
import { useMoviesPageNowPlaying } from '@/propsHooks/useMoviesPageNowPlaying';
import { Container, Stack, Title } from '@mantine/core';

const NowPlayingMoviesCarousel = () => {
	const nowPlayingMovies = useMoviesPageNowPlaying();

	return (
		<Container
			size='100%'
			px={60}
			mx={0}
		>
			<Stack>
				<Title pl={60}>NOW PLAYING</Title>
				<MediaCarousel
					items={nowPlayingMovies}
					mediaType='movie'
				/>
			</Stack>
		</Container>
	);
};

export default NowPlayingMoviesCarousel;
