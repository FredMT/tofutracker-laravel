import { Carousel } from "@mantine/carousel";
import { Container, Divider, Stack, Tabs, Text, Title } from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import AnimeCreditsCard from "./AnimeCreditsCard";
import classes from "./ContentCredits.module.css";
import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { TmdbPerson, AnimePerson, ContentCreditsProps } from "@/types";

export function ContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const regularContent = useContent();
    const animeContent = useAnimeContent();

    if (!regularContent && !animeContent) return null;
    if (regularContent?.type === "tvseason") return null;

    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

    if (animeContent) {
        const { cast, seiyuu } = animeContent.anidbData.credits;

        return (
            <>
                <Divider my={16} />
                <Stack>
                    <Title order={3}>Cast and Credits</Title>
                    <Container size={containerWidth} px={0} mx={0}>
                        <Carousel
                            height={280}
                            slideSize="270px"
                            align="start"
                            slidesToScroll={3}
                            dragFree={true}
                            classNames={{
                                control: classes.carouselControl,
                                controls: classes.carouselControls,
                            }}
                        >
                            {cast.map((character) => (
                                <Carousel.Slide key={character.id}>
                                    <AnimeCreditsCard
                                        character={character}
                                        seiyuus={seiyuu.filter((s) =>
                                            s.characters
                                                .split(", ")
                                                .includes(character.name)
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
                    dragFree={true}
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
