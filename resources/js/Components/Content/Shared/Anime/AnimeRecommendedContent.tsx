import AnimeRecommendedContentCard from '@/Components/Content/Shared/Anime/AnimeRecommendedContentCard';
import { CustomCarousel } from '@/Components/Shared/CustomCarousel';
import { useAnimeContent } from '@/propsHooks/useAnimeContent';
import { AnimeRecommendation } from '@/types/anime';
import { usePage } from '@inertiajs/react';
import { Carousel } from '@mantine/carousel';
import { Stack, Title } from '@mantine/core';

interface AnimeRecommendedContentProps {
	containerWidth: number;
	slideSize?: string;
}

export default function AnimeRecommendedContent({
	containerWidth,
	slideSize = '0%',
}: AnimeRecommendedContentProps) {
	const data = useAnimeContent();
	const currentMapId: number = usePage().url.split('/').pop();
	const recommendations = data.tmdbData.data.recommendations;

	if (!Boolean(recommendations.length)) return null;

	return (
		<Stack>
			<Title order={3}>Recommended</Title>
			<CustomCarousel
				containerWidth={containerWidth}
				slideSize={slideSize}
				height={300}
				slidesToScroll={3}
			>
				{data.tmdbData.data.recommendations
					.filter((rec) => rec.map_id !== +currentMapId!)
					.map((recommendation: AnimeRecommendation) => (
						<Carousel.Slide key={recommendation.map_id}>
							<AnimeRecommendedContentCard content={recommendation} />
						</Carousel.Slide>
					))}
			</CustomCarousel>
		</Stack>
	);
}
