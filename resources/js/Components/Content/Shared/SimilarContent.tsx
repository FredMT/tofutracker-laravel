import {RegularContentDataType, Similar} from "@/types";
import {Carousel} from "@mantine/carousel";
import {Stack, Title} from "@mantine/core";
import SimilarContentCard from "./SimilarContentCard";
import {CustomCarousel} from "@/Components/Shared/CustomCarousel";
import {usePage} from "@inertiajs/react";

interface SimilarContentProps {
    containerWidth: number;
    slideSize?: string;
}

export default function SimilarContent({
    containerWidth,
    slideSize = "0%",
}: SimilarContentProps) {
    const {data} = usePage<{data: RegularContentDataType}>().props;
    return (
        <Stack>
            <Title order={3}>Similar</Title>
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={300}
                slidesToScroll={3}
            >
                {data.similar.map((similar: Similar) => (
                    <Carousel.Slide key={similar.id}>
                        <SimilarContentCard content={similar} />
                    </Carousel.Slide>
                ))}
            </CustomCarousel>
        </Stack>
    );
}
