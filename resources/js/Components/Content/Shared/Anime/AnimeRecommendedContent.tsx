import { useAnimeContent } from "@/hooks/useAnimeContent";
import { AnimeRecommendation } from "@/types/anime";
import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import AnimeRecommendedContentCard from "@/Components/Content/Shared/Anime/AnimeRecommendedContentCard";
import { usePage } from "@inertiajs/react";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";

interface AnimeRecommendedContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function AnimeRecommendedContent({
    containerWidth,
    slideSize = "0%",
}: AnimeRecommendedContentProps) {
    const animeContent = useAnimeContent();
    if (!animeContent) return null;
    const { tmdbData } = animeContent;
    const currentMapId = usePage().url.split("/").pop();

    return (
        <Stack>
            <Title order={3}>Recommended</Title>
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
            >
                {tmdbData.recommendations
                    .filter((rec) => rec.map_id !== +currentMapId!)
                    .map((recommendation: AnimeRecommendation) => (
                        <Carousel.Slide key={recommendation.map_id}>
                            <AnimeRecommendedContentCard
                                content={recommendation}
                            />
                        </Carousel.Slide>
                    ))}
            </CustomCarousel>
        </Stack>
    );
}
