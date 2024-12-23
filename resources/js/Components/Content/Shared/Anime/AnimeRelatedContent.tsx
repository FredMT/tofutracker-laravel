import { Carousel } from "@mantine/carousel";
import { Container, Stack, Tabs, Title } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import classes from "./AnimeRelatedContent.module.css";
import { useMediaQuery } from "@mantine/hooks";
import AnimeRelatedContentCard from "@/Components/Content/Shared/Anime/AnimeRelatedContentCard";

interface AnimeRelatedContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function AnimeRelatedContent({
    containerWidth,
    slideSize = "0%",
}: AnimeRelatedContentProps) {
    const { animeseason } = usePage<PageProps>().props;
    const isMobile = useMediaQuery("(max-width: 640px)");

    if (!animeseason) return null;

    // Filter out invalid entries
    const validRelatedAnime = animeseason.related_anime.filter(
        (anime) => anime.id != null && anime.map_id != null
    );
    const validSimilarAnime = animeseason.similar_anime.filter(
        (anime) => anime.id != null && anime.map_id != null
    );

    if (!validRelatedAnime.length && !validSimilarAnime.length) return null;

    return (
        <Stack>
            <Title order={3}>Related Content</Title>

            <Tabs
                defaultValue={
                    validRelatedAnime.length > 0 ? "related" : "similar"
                }
            >
                <Tabs.List>
                    {validRelatedAnime.length > 0 && (
                        <Tabs.Tab value="related">Related Anime</Tabs.Tab>
                    )}
                    {validSimilarAnime.length > 0 && (
                        <Tabs.Tab value="similar">Similar Anime</Tabs.Tab>
                    )}
                </Tabs.List>
                {validRelatedAnime.length > 0 && (
                    <Tabs.Panel value="related">
                        <Container size={containerWidth} px={0} mx={0}>
                            <Carousel
                                height={300}
                                slideSize={slideSize}
                                align="start"
                                slidesToScroll={isMobile ? 1 : 3}
                                classNames={{
                                    control: classes.carouselControl,
                                    controls: classes.carouselControls,
                                }}
                            >
                                {validRelatedAnime.map((anime) => (
                                    <Carousel.Slide key={anime.id}>
                                        <AnimeRelatedContentCard
                                            content={anime}
                                            type="related"
                                        />
                                    </Carousel.Slide>
                                ))}
                            </Carousel>
                        </Container>
                    </Tabs.Panel>
                )}

                {validSimilarAnime.length > 0 && (
                    <Tabs.Panel value="similar">
                        <Container size={containerWidth} px={0} mx={0}>
                            <Carousel
                                height={300}
                                slideSize={slideSize}
                                align="start"
                                slidesToScroll={isMobile ? 1 : 3}
                                classNames={{
                                    control: classes.carouselControl,
                                    controls: classes.carouselControls,
                                }}
                            >
                                {validSimilarAnime.map((anime) => (
                                    <Carousel.Slide key={anime.id}>
                                        <AnimeRelatedContentCard
                                            content={anime}
                                            type="similar"
                                        />
                                    </Carousel.Slide>
                                ))}
                            </Carousel>
                        </Container>
                    </Tabs.Panel>
                )}
            </Tabs>
        </Stack>
    );
}
