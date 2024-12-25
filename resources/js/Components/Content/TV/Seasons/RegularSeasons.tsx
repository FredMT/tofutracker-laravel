import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import SeasonCard from "./SeasonCard";
import classes from "../../../Content/Shared/SimilarContent.module.css";
interface SeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function RegularSeasons({
    containerWidth,
    slideSize = "0%",
}: SeasonsProps) {
    const { tv } = usePage<PageProps>().props;
    if (!tv) return null;

    return (
        <Stack>
            <Title order={3}>Seasons</Title>
            <Container size={containerWidth} px={0} mx={0}>
                <Carousel
                    height={250}
                    slideSize={slideSize}
                    align="start"
                    slidesToScroll={3}
                    classNames={{
                        control: classes.carouselControl,
                        controls: classes.carouselControls,
                    }}
                >
                    {tv.seasons.map((season) => (
                        <Carousel.Slide key={season.id}>
                            <SeasonCard season={season} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );
}
