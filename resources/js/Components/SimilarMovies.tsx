import { Carousel } from "@mantine/carousel";
import { Container, Stack, Title } from "@mantine/core";
import SimilarMovieCard from "./SimilarMovieCard";
import classes from "./SimilarMovies.module.css";
import { SimilarMovie } from "@/types";

interface SimilarMoviesProps {
    similarMovies: SimilarMovie[];
    containerWidth: number;
    slideSize?: string;
}

export default function SimilarMovies({
    similarMovies,
    containerWidth,
    slideSize = "0%",
}: SimilarMoviesProps) {
    return (
        <Stack>
            <Title order={4}>Similar</Title>
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
                    {similarMovies.map((similarMovie) => (
                        <Carousel.Slide key={similarMovie.id}>
                            <SimilarMovieCard
                                key={similarMovie.id}
                                movie={similarMovie}
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );
}
