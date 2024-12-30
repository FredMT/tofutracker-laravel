import { Carousel } from "@mantine/carousel";
import {
    Container,
    ContainerProps,
    Title,
    Stack,
    Space,
    Group,
    Menu,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronDown } from "lucide-react";
import React from "react";
import classes from "./WelcomeCustomCarousel.module.css";
import WelcomeCarouselCard from "./WelcomeCarouselCard";

interface ContentItem {
    title: string;
    release_date: string;
    poster_path: string;
    vote_average: number;
    popularity: number;
    link: number | string;
    type: string;
}

interface WelcomeCustomCarouselContentProps {
    children?: React.ReactNode;
    containerWidth?: ContainerProps["size"];
    slideSize?: string;
    height?: number;
    slidesToScroll?: number;
    withControls?: boolean;
    align?: "start" | "center" | "end";
    className?: string;
    slideGap?: number;
    title?: string;
    titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
    movies: ContentItem[];
    tvShows: ContentItem[];
    anime: ContentItem[];
}

export function WelcomeCustomCarouselContent({
    containerWidth = "100%",
    slideSize = "300px",
    height = 300,
    slidesToScroll = 3,
    withControls = true,
    align = "start",
    slideGap = 0,
    className,
    titleOrder = 1,
    movies,
    tvShows,
    anime,
}: WelcomeCustomCarouselContentProps) {
    const isMobile = useMediaQuery("(max-width: 500px)");
    const [activeTab, setActiveTab] = React.useState<string>("tv");

    // If on mobile, only scroll 1 slide at a time
    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

    const getContentByType = () => {
        const getUniqueByLink = (items: ContentItem[]) => {
            const uniqueLinks = new Set();
            return items.filter((item) => {
                if (uniqueLinks.has(item.link)) return false;
                uniqueLinks.add(item.link);
                return true;
            });
        };

        switch (activeTab) {
            case "movies":
                return getUniqueByLink(movies).sort(
                    (a, b) => b.popularity - a.popularity
                );
            case "tv":
                return getUniqueByLink(tvShows).sort(
                    (a, b) => b.popularity - a.popularity
                );
            case "anime":
                return getUniqueByLink(anime).sort(
                    (a, b) => b.popularity - a.popularity
                );
            default:
                return [];
        }
    };

    const getTabTitle = () => {
        switch (activeTab) {
            case "movies":
                return "Movies";
            case "tv":
                return "TV Shows";
            case "anime":
                return "Anime";
            default:
                return "";
        }
    };

    return (
        <Stack gap="xs">
            <Group>
                <Menu shadow="md">
                    <Menu.Target>
                        <Group gap="xs" style={{ cursor: "pointer" }}>
                            {isMobile ? (
                                <Stack gap={0}>
                                    <Title order={titleOrder}>Top 10</Title>
                                    <Group gap="xs">
                                        <Title order={titleOrder}>
                                            {getTabTitle()}
                                        </Title>
                                        <ChevronDown size={24} />
                                    </Group>
                                </Stack>
                            ) : (
                                <Group gap="xs">
                                    <Title order={titleOrder}>
                                        Top 10 {getTabTitle()}
                                    </Title>
                                    <ChevronDown size={24} />
                                </Group>
                            )}
                        </Group>
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item onClick={() => setActiveTab("movies")}>
                            Movies
                        </Menu.Item>
                        <Menu.Item onClick={() => setActiveTab("tv")}>
                            TV Shows
                        </Menu.Item>
                        <Menu.Item onClick={() => setActiveTab("anime")}>
                            Anime
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
            <Space h="xs" />
            <Container
                size={containerWidth}
                className="select-none"
                px={0}
                mx={0}
            >
                <Carousel
                    key={activeTab}
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
                    {getContentByType().map((content) => (
                        <Carousel.Slide key={`${content.type}-${content.link}`}>
                            <WelcomeCarouselCard
                                id={Number(content.link)}
                                title={content.title}
                                posterPath={content.poster_path}
                                type={content.type}
                                vote_average={content.vote_average}
                            />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            </Container>
        </Stack>
    );
}

export default WelcomeCustomCarouselContent;
