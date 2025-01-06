import AnimeSeasonCard from "@/Components/Content/TV/Seasons/AnimeSeasonCard";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import {Anime, RelatedAnimeData} from "@/types/anime";
import {Link, usePage} from "@inertiajs/react";
import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";

interface AnimeSeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function AnimeSeasons({
    containerWidth,
    slideSize = "0%",
}: AnimeSeasonsProps) {
    const {data} = usePage<{data: Anime}>().props

    const renderCarousel = (items: RelatedAnimeData[], title: string) => (
        <Stack key={title}>
            <Title order={3}>{title}</Title>
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
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
            </CustomCarousel>
        </Stack>
    );

    return (
        <Stack gap={8}>
            <Title order={2}>Seasons</Title>

            {Object.keys(data.anidbData.prequel_sequel_chains).length >
                0 &&
                Object.entries(data.anidbData.prequel_sequel_chains).map(
                    ([chainName, seasons]) => renderCarousel(seasons, chainName)
                )}

            {data.anidbData.other_related_ids.length > 0 &&
                renderCarousel(data.anidbData.other_related_ids, "Other Related Content")}
        </Stack>
    );
}
