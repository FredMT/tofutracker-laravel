import { Divider, Space, Stack, Title } from '@mantine/core';
import AnimeCreditsCard from '../Anime/AnimeCreditsCard';
import { ContentCreditsProps } from '@/types';
import { AnimeSeason, Cast } from '@/types/animeseason';
import { CustomCarousel } from '@/Components/Shared/CustomCarousel';
import { Carousel } from '@mantine/carousel';
import { Anime } from '@/types/anime';
import { useSpoilerConfiguration } from '@/stores/useSpoilerConfiguration';
import { useAnimeTypes } from '@/propsHooks/useAnimeTypes';
import { useAnimeContentData } from '@/propsHooks/useAnimeContentData';

export function AnimeContentCredits({ containerWidth }: ContentCreditsProps) {
	const type = useAnimeTypes();
	let data = useAnimeContentData();

	const configuration = useSpoilerConfiguration().configuration;

	let cast: Cast[];
	let seiyuu: Cast[];

	if (type === 'animeseason') {
		data = data as AnimeSeason;
		cast = data.credits.cast;
		seiyuu = data.credits.seiyuu;
	} else {
		data = data as Anime;
		cast = data.anidbData.credits.cast;
		seiyuu = data.anidbData.credits.seiyuu;
	}

	if (!cast?.length || !seiyuu?.length) return null;

	return (
		<>
			<Space
				h={24}
				hiddenFrom='smlg'
			/>
			<Divider my={16} />
			<Stack>
				<Title order={3}>Cast and Credits</Title>
				<CustomCarousel
					containerWidth={containerWidth}
					height={280}
					slideSize='300px'
					slidesToScroll={2}
				>
					{cast.map((character) => (
						<Carousel.Slide key={character.id}>
							<AnimeCreditsCard
								character={character}
								seiyuus={seiyuu.filter(
									(s) =>
										s.characters?.split(', ')?.includes(character.name) ?? false
								)}
								hideAnimeCharacterPicture={
									configuration.hide_anime_character_picture
								}
								hideCharacterName={configuration.hide_character_name}
							/>
						</Carousel.Slide>
					))}
				</CustomCarousel>
			</Stack>
		</>
	);
}
