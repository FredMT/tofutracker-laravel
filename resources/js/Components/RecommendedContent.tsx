import { useContent } from "@/hooks/useContent";
import { Recommended } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import classes from "./RecommendedContent.module.css";
import RecommendedContentCard from "./RecommendedContentCard";

interface RecommendedContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function RecommendedContent({
    containerWidth,
    slideSize = "0%",
}: RecommendedContentProps) {
    const { content, type } = useContent();
    if (!content || type === "tvseason") return null;

    return (
        <Stack>
            <Title order={3}>Recommended</Title>
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
                    {content.recommended.map((recommended: Recommended) => (
                        <Carousel.Slide key={recommended.id}>
                            <RecommendedContentCard content={recommended} />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );
}
