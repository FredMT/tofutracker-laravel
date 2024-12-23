import { Carousel } from "@mantine/carousel";
import {
    Container,
    Divider,
    Space,
    Stack,
    Tabs,
    Text,
    Title,
} from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import AnimeCreditsCard from "../Anime/AnimeCreditsCard";
import classes from "./ContentCredits.module.css";
import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import {
    TmdbPerson,
    AnimePerson,
    ContentCreditsProps,
    PageProps,
} from "@/types";
import { useMediaQuery } from "@mantine/hooks";
import { usePage } from "@inertiajs/react";
import { Cast } from "@/types/animeseason";

export function ContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const regularContent = useContent();
    const animeContent = useAnimeContent();
    const isMobile = useMediaQuery("(max-width: 640px)");
    const type = usePage<PageProps>().props.type as string;
    const { animeseason } = usePage<PageProps>().props;

    if (!regularContent && !animeContent) return null;
    if (regularContent?.type === "tvseason") return null;

    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

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
                    <Container
                        size={containerWidth}
                        className="select-none"
                        px={0}
                        mx={0}
                    >
                        <Carousel
                            height={280}
                            slideSize="300px"
                            align="start"
                            slidesToScroll={isMobile ? 1 : 2}
                            classNames={{
                                control: classes.carouselControl,
                                controls: classes.carouselControls,
                            }}
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
                        </Carousel>
                    </Container>
                </Stack>
            </>
        );
    }

    // Regular content rendering (existing code)
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

            <Container size={containerWidth} px={0} mx={0}>
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
                    {people.map((person) => (
                        <Carousel.Slide key={person.id}>
                            <PersonCard
                                person={person}
                                type={activeTab}
                                isAnime={false}
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </>
    );
}
