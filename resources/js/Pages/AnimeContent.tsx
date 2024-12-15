import AnimeRecommendedContent from "@/Components/AnimeRecommendedContent";
import { ContentActions } from "@/Components/ContentActions/ContentActions";
import { ContentBanner } from "@/Components/ContentBanner";
import { ContentCredits } from "@/Components/ContentCredits";
import ContentDetails from "@/Components/ContentDetails";
import { ContentSummary } from "@/Components/ContentSummary";
import PosterImage from "@/Components/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import SimilarContent from "@/Components/SimilarContent";
import ThemeButton from "@/Components/ThemeButton";
import Seasons from "@/Components/TV/Seasons/Seasons";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { useContent } from "@/hooks/useContent";
import ContentLayout from "@/Layouts/ContentLayout";
import { PageProps } from "@/types";
import { Anime, ShowData, MovieData } from "@/types/anime";
import { Head, usePage } from "@inertiajs/react";
import {
    Box,
    Divider,
    Space,
    Spoiler,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

export default function AnimeContent() {
    const { width } = useViewportSize();
    const animeContent = useAnimeContent();
    if (!animeContent) return null;

    const { content, tmdbData } = animeContent;

    return (
        <>
            <Head title={content.collection_name} />
            <ThemeButton />
            <ContentBanner />
            <ResponsiveContainer>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="center">
                            <PosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {content.collection_name}
                                </Title>

                                {tmdbData.tagline && (
                                    <Text ta={"center"}>
                                        {tmdbData.tagline}
                                    </Text>
                                )}
                                <Divider my={16} />
                                <ContentSummary />
                                <Divider my={16} />
                            </Box>
                            <ContentActions />
                            <Box hiddenFrom="sm">
                                <Stack mt={16}>
                                    <Title order={3}>Overview</Title>
                                    <Spoiler
                                        maxHeight={120}
                                        showLabel="Show more"
                                        hideLabel="Hide"
                                    >
                                        <Text>
                                            {tmdbData.overview ??
                                                "No overview available"}
                                        </Text>
                                    </Spoiler>
                                </Stack>
                                <Space h={24} />
                                <ContentCredits containerWidth={width * 0.95} />
                                <Divider my={24} />

                                <Seasons containerWidth={width * 0.95} />

                                <AnimeRecommendedContent
                                    containerWidth={width * 0.95}
                                />
                            </Box>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <Title order={2}>{tmdbData.title}</Title>
                                {tmdbData.tagline && (
                                    <Text>{tmdbData.tagline}</Text>
                                )}
                                <Divider my={8} />
                                <ContentSummary />
                                <Divider my={8} />
                            </Stack>
                            <Stack mt={16}>
                                <Title order={3}>Overview</Title>
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>
                                        {tmdbData.overview ??
                                            "No overview available"}
                                    </Text>
                                </Spoiler>
                            </Stack>
                            <Space h={24} />
                            <ContentCredits containerWidth={width * 0.67} />
                            <Divider my={24} />

                            <Seasons containerWidth={width * 0.67} />
                            <Divider my={16} />
                            <AnimeRecommendedContent
                                containerWidth={width * 0.67}
                            />
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}
