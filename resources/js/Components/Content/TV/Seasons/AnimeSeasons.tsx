import AnimeSeasonCard from "@/Components/Content/TV/Seasons/AnimeSeasonCard";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { RelatedAnimeData } from "@/types/anime";
import { Link } from "@inertiajs/react";
import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import classes from "../../../Content/Shared/SimilarContent.module.css";

interface AnimeSeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function AnimeSeasons({
    containerWidth,
    slideSize = "0%",
}: AnimeSeasonsProps) {
    const animeContent = useAnimeContent();
    if (!animeContent) return null;

    const { anidbData } = animeContent;
    const { other_related_ids, prequel_sequel_chains } = anidbData;

    const renderCarousel = (items: RelatedAnimeData[], title: string) => (
        <Stack key={title}>
            <Title order={3}>{title}</Title>
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
                    {items.map((season) => (
                        <Carousel.Slide key={season.id}>
                            {season.type === "Music Video" ||
                            season.type === "unknown" ? (
                                <AnimeSeasonCard season={season} />
                            ) : (
                                <Link
                                    href={route("anime.season.show", {
                                        id: season.map_id,
                                        seasonId: season.id,
                                    })}
                                    prefetch
                                >
                                    <AnimeSeasonCard season={season} />
                                </Link>
                            )}
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );

    return (
        <Stack gap={8}>
            <Title order={2}>Seasons</Title>

            {Object.keys(animeContent.anidbData.prequel_sequel_chains).length >
                0 &&
                Object.entries(prequel_sequel_chains).map(
                    ([chainName, seasons]) => renderCarousel(seasons, chainName)
                )}

            {other_related_ids.length > 0 &&
                renderCarousel(other_related_ids, "Other Related Content")}
        </Stack>
    );
}
