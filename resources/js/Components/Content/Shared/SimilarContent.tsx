import { useContent } from "@/hooks/useContent";
import { Similar } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import SimilarContentCard from "./SimilarContentCard";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";

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
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
            >
                {content.similar.map((similar: Similar) => (
                    <Carousel.Slide key={similar.id}>
                        <SimilarContentCard content={similar} />
                    </Carousel.Slide>
                ))}
            </CustomCarousel>
        </Stack>
    );
}
