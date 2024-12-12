import { Carousel } from "@mantine/carousel";
import { Container, Tabs, Text } from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import classes from "./ContentCredits.module.css";
import { PageProps, Person } from "@/types";
import { usePage } from "@inertiajs/react";

interface ContentCreditsProps {
    containerWidth: number;
    slideSize?: string;
}

export function ContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const { type, movie, tv, anime, tvseason } = usePage<PageProps>().props;
    const content =
        type === "movie"
            ? movie
            : type === "tv"
            ? tv
            : type === "tvseason"
            ? tvseason
            : anime;
    if (!content) return null;
    if (type === "tvseason") return null;

    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");
    const people =
        activeTab === "cast" ? content.credits.cast : content.credits.crew;

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
                    {people.map((person: Person) => (
                        <Carousel.Slide key={person.id}>
                            <PersonCard person={person} type={activeTab} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </>
    );
}
