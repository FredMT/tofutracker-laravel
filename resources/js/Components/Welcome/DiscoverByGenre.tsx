import {Carousel} from "@mantine/carousel";
import {Card, Container, ContainerProps, Drawer, Flex, Group, Modal, Space, Stack, Text, Title,} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {ChevronDown} from "lucide-react";
import React from "react";
import classes from "./WelcomeCustomCarousel.module.css";
import WelcomeCarouselCard from "./WelcomeCarouselCard";

interface GenreItem {
    id: string | number;
    anime_id?: number;
    media_type: string;
    title: string;
    release_date: string;
    vote_average: number;
    popularity: number;
    poster_path: string | null;
    backdrop_path: string | null;
}

interface GenreData {
    genre_name: string;
    items: GenreItem[];
}

interface DiscoverByGenreProps {
    containerWidth?: ContainerProps["size"];
    slideSize?: string;
    height?: number;
    slidesToScroll?: number;
    withControls?: boolean;
    align?: "start" | "center" | "end";
    className?: string;
    slideGap?: number;
    titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
    genres: Record<string, GenreData>;
}

export function DiscoverByGenre({
    containerWidth = "100%",
    slideSize = "300px",
    height = 300,
    slidesToScroll = 3,
    withControls = true,
    align = "start",
    slideGap = 0,
    className,
    titleOrder = 3,
    genres,
}: DiscoverByGenreProps) {
    const isMobile = useMediaQuery("(max-width: 600px)");
    const isSmall = useMediaQuery("(max-width: 48em)");
    const [activeGenreId, setActiveGenreId] = React.useState<string>(
        Object.keys(genres)[0] || ""
    );
    const [modalOpened, setModalOpened] = React.useState(false);

    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;
    const activeGenre = genres[activeGenreId];

    if (!activeGenre) return null;

    const genreSelector = (
        <Group
            gap="xs"
            style={{ cursor: "pointer" }}
            onClick={() => setModalOpened(true)}
        >
            <Title order={titleOrder}>{activeGenre.genre_name}</Title>
            <ChevronDown size={24} />
        </Group>
    );

    const genreCards = (
        <Flex
            gap="md"
            justify="flex-start"
            align="stretch"
            direction="row"
            wrap="wrap"
        >
            {Object.entries(genres).map(([genreId, genre]) => (
                <Card
                    key={genreId}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                        cursor: "pointer",
                        width: isSmall ? "100%" : "calc(33.33% - 16px)",
                        backgroundColor:
                            activeGenreId === genreId
                                ? "var(--mantine-color-blue-light)"
                                : undefined,
                    }}
                    onClick={() => {
                        setActiveGenreId(genreId);
                        setModalOpened(false);
                    }}
                >
                    <Text fw={500} size="lg">
                        {genre.genre_name}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {genre.items.length} items
                    </Text>
                </Card>
            ))}
        </Flex>
    );

    return (
        <Stack gap="xs">
            {isMobile ? (
                <Stack gap="xs">
                    <Title order={titleOrder}>Discover by Genre</Title>
                    {genreSelector}
                </Stack>
            ) : (
                <Group>
                    <Title order={titleOrder}>Discover by Genre:</Title>
                    {genreSelector}
                </Group>
            )}
            <Space h="xs" />
            <Container
                size={containerWidth}
                className="select-none"
                px={0}
                mx={0}
            >
                <Carousel
                    key={activeGenreId}
                    height={height}
                    slideSize={slideSize}
                    align={align}
                    slidesToScroll={mobileSlidesToScroll}
                    withControls={withControls}
                    classNames={{
                        control: classes.carouselControl,
                        controls: classes.carouselControls,
                    }}
                    className={className}
                    slideGap={slideGap}
                >
                    {activeGenre.items.map((item: GenreItem) => (
                        <Carousel.Slide key={`${item.media_type}-${item.id}`}>
                            <WelcomeCarouselCard
                                id={item.id}
                                anime_id={item.anime_id}
                                title={item.title}
                                posterPath={item.poster_path}
                                type={item.media_type}
                                vote_average={item.vote_average}
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>

            {isSmall ? (
                <Drawer
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title="Select a Genre"
                    position="bottom"
                    size="90%"
                >
                    {genreCards}
                </Drawer>
            ) : (
                <Modal
                    opened={modalOpened}
                    onClose={() => setModalOpened(false)}
                    title="Select a Genre"
                    size="xl"
                >
                    {genreCards}
                </Modal>
            )}
        </Stack>
    );
}

export default DiscoverByGenre;
