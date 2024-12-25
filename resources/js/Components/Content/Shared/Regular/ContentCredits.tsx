import { Divider, Space, Stack, Tabs, Text, Title } from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import AnimeCreditsCard from "../Anime/AnimeCreditsCard";
import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import {
    TmdbPerson,
    AnimePerson,
    ContentCreditsProps,
    PageProps,
} from "@/types";
import { usePage } from "@inertiajs/react";
import { Cast } from "@/types/animeseason";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";
import { Carousel } from "@mantine/carousel";

export function ContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const regularContent = useContent();
    const animeContent = useAnimeContent();
    const type = usePage<PageProps>().props.type as string;
    const { animeseason } = usePage<PageProps>().props;

    if (!regularContent && !animeContent) return null;
    if (regularContent?.type === "tvseason") return null;

    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");
    if (type !== "movie" && type !== "tv") {
        const shouldRenderAnimeCredits = [
            "animeseason",
            "animetv",
            "animemovie",
        ].includes(type);

        if (!shouldRenderAnimeCredits) return null;

        let cast: Cast[] = [];
        let seiyuu: Cast[] = [];

        if (type === "animeseason" && animeseason) {
            cast = animeseason.credits.cast;
            seiyuu = animeseason.credits.seiyuu;
        } else if (animeContent?.anidbData.credits) {
            cast = animeContent.anidbData.credits.cast;
            seiyuu = animeContent.anidbData.credits.seiyuu;
        }

        if (!cast || !seiyuu) return null;

        if (!cast.length || !seiyuu.length) return null;

        if (animeContent || animeseason) {
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
                                                    ?.includes(
                                                        character.name
                                                    ) ?? false
                                        )}
                                    />
                                </Carousel.Slide>
                            ))}
                        </CustomCarousel>
                    </Stack>
                </>
            );
        }
    }

    // Regular content rendering
    const people = (
        activeTab === "cast"
            ? regularContent!.content.credits.cast
            : regularContent!.content.credits.crew
    ) as (TmdbPerson | AnimePerson)[];

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value as "cast" | "crew")}
                variant="outline"
            >
                <Tabs.List>
                    <Tabs.Tab value="cast">
                        <Text fw={500}>Cast</Text>
                    </Tabs.Tab>
                    <Tabs.Tab value="crew">
                        <Text fw={500}>Crew</Text>
                    </Tabs.Tab>
                </Tabs.List>
            </Tabs>

            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
            >
                {people.map((person) => (
                    <Carousel.Slide key={person.id}>
                        <PersonCard
                            person={person}
                            type={activeTab}
                            isAnime={false}
                        />
                    </Carousel.Slide>
                ))}
            </CustomCarousel>
        </>
    );
}
