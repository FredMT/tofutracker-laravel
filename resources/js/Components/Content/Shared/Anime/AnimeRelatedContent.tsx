import { Carousel } from "@mantine/carousel";
import { Stack, Tabs, Title } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import AnimeRelatedContentCard from "@/Components/Content/Shared/Anime/AnimeRelatedContentCard";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";

interface AnimeRelatedContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function AnimeRelatedContent({
    containerWidth,
    slideSize = "0%",
}: AnimeRelatedContentProps) {
    const { animeseason } = usePage<PageProps>().props;

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
                        <CustomCarousel
                            containerWidth={containerWidth}
                            slideSize={slideSize}
                            height={300}
                            slidesToScroll={3}
                        >
                            {validRelatedAnime.map((anime) => (
                                <Carousel.Slide key={anime.id}>
                                    <AnimeRelatedContentCard
                                        content={anime}
                                        type="related"
                                    />
                                </Carousel.Slide>
                            ))}
                        </CustomCarousel>
                    </Tabs.Panel>
                )}

                {validSimilarAnime.length > 0 && (
                    <Tabs.Panel value="similar">
                        <CustomCarousel
                            containerWidth={containerWidth}
                            slideSize={slideSize}
                            height={300}
                            slidesToScroll={3}
                        >
                            {validSimilarAnime.map((anime) => (
                                <Carousel.Slide key={anime.id}>
                                    <AnimeRelatedContentCard
                                        content={anime}
                                        type="similar"
                                    />
                                </Carousel.Slide>
                            ))}
                        </CustomCarousel>
                    </Tabs.Panel>
                )}
            </Tabs>
        </Stack>
    );
}
