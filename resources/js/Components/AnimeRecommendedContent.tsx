import { useAnimeContent } from "@/hooks/useAnimeContent";
import { AnimeRecommendation } from "@/types/anime";
import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import classes from "./AnimeRecommendedContent.module.css";
import AnimeRecommendedContentCard from "@/Components/AnimeRecommendedContentCard";
import { usePage } from "@inertiajs/react";

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
            <Container
                size={containerWidth}
                px={0}
                mx={0}
                className="select-none"
            >
                <Carousel
                    height={300}
                    slideSize={slideSize}
                    align="start"
                    slidesToScroll={3}
                    classNames={{
                        control: classes.carouselControl,
                        controls: classes.carouselControls,
                    }}
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
                </Carousel>
            </Container>
        </Stack>
    );
}
