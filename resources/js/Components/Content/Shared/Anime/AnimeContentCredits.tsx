import { Divider, Space, Stack, Title } from "@mantine/core";
import AnimeCreditsCard from "../Anime/AnimeCreditsCard";
import { AnimeContentDataType, AnimeType, ContentCreditsProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { AnimeSeason, Cast } from "@/types/animeseason";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";
import { Carousel } from "@mantine/carousel";
import { Anime } from "@/types/anime";

export function AnimeContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const { type } = usePage<{ type: AnimeType }>().props;
    let { data } = usePage<{ data: AnimeContentDataType }>().props;

    let cast: Cast[];
    let seiyuu: Cast[];

    if (type === "animeseason") {
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
            <Space h={24} hiddenFrom="smlg" />
            <Divider my={16} />
            <Stack>
                <Title order={3}>Cast and Credits</Title>
                <CustomCarousel
                    containerWidth={containerWidth}
                    height={280}
                    slideSize="300px"
                    slidesToScroll={2}
                >
                    {cast.map((character) => (
                        <Carousel.Slide key={character.id}>
                            <AnimeCreditsCard
                                character={character}
                                seiyuus={seiyuu.filter(
                                    (s) =>
                                        s.characters
                                            ?.split(", ")
                                            ?.includes(character.name) ?? false
                                )}
                            />
                        </Carousel.Slide>
                    ))}
                </CustomCarousel>
            </Stack>
        </>
    );
}
