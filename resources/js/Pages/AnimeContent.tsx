import AnimeRecommendedContent from "@/Components/Content/Shared/Anime/AnimeRecommendedContent";
import { BannerImageContainer } from "@/Components/Content/Shared/Regular/BannerImageContainer";
import ContentActions from "@/Components/ContentActions/ContentActions";
import { ContentCredits } from "@/Components/Content/Shared/Regular/ContentCredits";
import { ContentSummary } from "@/Components/Content/Shared/Regular/ContentSummary";
import PosterImage from "@/Components/Content/Shared/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import Seasons from "@/Components/TV/Seasons/Seasons";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import { Head } from "@inertiajs/react";
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
            <AuthenticatedLayout>
                <BannerImageContainer />
                <ResponsiveContainer>
                    <Space h={24} />
                    <ContentLayout
                        left={
                            <Stack gap={24}>
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
                                    <Space h={16} />
                                    <ContentSummary />
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
                                    <ContentCredits
                                        containerWidth={width * 0.95}
                                    />
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
                                    <ContentSummary />
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
                                <Divider my={16} />

                                <Seasons containerWidth={width * 0.67} />
                                <AnimeRecommendedContent
                                    containerWidth={width * 0.67}
                                />
                            </Box>
                        }
                    />
                </ResponsiveContainer>
            </AuthenticatedLayout>
        </>
    );
}
