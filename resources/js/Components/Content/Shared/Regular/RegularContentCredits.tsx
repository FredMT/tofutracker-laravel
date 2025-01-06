import { Tabs, Text } from "@mantine/core";
import { useState } from "react";
import PersonCard from "./PersonCard";
import {
    ContentCreditsProps,
    RegularContentDataType,
    TmdbPerson,
} from "@/types";
import { usePage } from "@inertiajs/react";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";
import { Carousel } from "@mantine/carousel";

export function RegularContentCredits({
    containerWidth,
    slideSize = "0%",
}: ContentCreditsProps) {
    const { data } = usePage<{ data: RegularContentDataType }>().props;

    const [activeTab, setActiveTab] = useState<"cast" | "crew">("cast");

    const people: TmdbPerson[] = activeTab === "cast" ? data.credits.cast : data.credits.crew;

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
