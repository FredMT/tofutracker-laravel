import { Recommended, RegularContentDataType } from "@/types";
import { Carousel } from "@mantine/carousel";
import { Container, Divider, Stack, Title } from "@mantine/core";
import classes from "./RecommendedContent.module.css";
import RecommendedContentCard from "./RecommendedContentCard";
import { usePage } from "@inertiajs/react";
import CustomCarousel from "@/Components/Shared/CustomCarousel";

interface RecommendedContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function RecommendedContent({
    containerWidth,
    slideSize = "0%",
}: RecommendedContentProps) {
    const { data } = usePage<{ data: RegularContentDataType }>().props;

    if (!data.recommended || data.recommended.length < 1) return null;

    return (
        <Stack>
            <Divider my={16} />
            <Title order={3}>Recommended</Title>
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
            >
                {data.recommended.map((recommended: Recommended) => (
                    <Carousel.Slide key={recommended.id}>
                        <RecommendedContentCard content={recommended} />
                    </Carousel.Slide>
                ))}
            </CustomCarousel>
            <Divider my={16} />
        </Stack>
    );
}
