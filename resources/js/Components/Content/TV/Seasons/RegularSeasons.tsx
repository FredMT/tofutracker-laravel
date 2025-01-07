import { Carousel } from "@mantine/carousel";
import { Stack, Title } from "@mantine/core";
import { PageProps, TvShow } from "@/types";
import { usePage } from "@inertiajs/react";
import SeasonCard from "./SeasonCard";
import { CustomCarousel } from "@/Components/Shared/CustomCarousel";

interface SeasonsProps {
    containerWidth: number;
    slideSize?: string;
}

export default function RegularSeasons({
    containerWidth,
    slideSize = "0%",
}: SeasonsProps) {
    const { data } = usePage<{ data: TvShow }>().props;

    return (
        <Stack>
            <Title order={3}>Seasons</Title>
            <CustomCarousel
                containerWidth={containerWidth}
                slideSize={slideSize}
                height={250}
                slidesToScroll={3}
            >
                {data.seasons.map((season) => (
                    <Carousel.Slide key={season.id}>
                        <SeasonCard season={season} />
                    </Carousel.Slide>
                ))}
            </CustomCarousel>
        </Stack>
    );
}
