import { useContent } from "@/hooks/useContent";
import { Similar } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import classes from "./SimilarContent.module.css";
import SimilarContentCard from "./SimilarContentCard";

interface SimilarContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function SimilarContent({
    containerWidth,
    slideSize = "0%",
}: SimilarContentProps) {
    const { content, type } = useContent();
    if (!content || type === "tvseason") return null;

    return (
        <Stack>
            <Title order={3}>Similar</Title>
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
