import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import SimilarContentCard from "./SimilarContentCard";
import classes from "./SimilarContent.module.css";
import { PageProps, Similar } from "@/types";
import { usePage } from "@inertiajs/react";

interface SimilarContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function SimilarContent({
    containerWidth,
    slideSize = "0%",
}: SimilarContentProps) {
    const { type, movie, tv, anime } = usePage<PageProps>().props;
    const content = type === "movie" ? movie : type === "tv" ? tv : anime;
    if (!content) return null;

    return (
        <Stack>
            <Title order={3}>Similar</Title>
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
                    {content.similar.map((similar: Similar) => (
                        <Carousel.Slide key={similar.id}>
                            <SimilarContentCard content={similar} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );
}
