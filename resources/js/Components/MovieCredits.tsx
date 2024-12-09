import { CastMember, CrewMember } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Container, Tabs, Text } from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import classes from "./MovieCredits.module.css";

interface MovieCreditsProps {
    cast: CastMember[];
    crew: CrewMember[];
    containerWidth: number;
    slideSize?: string;
}

export function MovieCredits({
    cast,
    crew,
    containerWidth,
    slideSize = "15%",
}: MovieCreditsProps) {
    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");
    const people = activeTab === "cast" ? cast : crew;

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
                            <PersonCard person={person} type={activeTab} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </>
    );
}
