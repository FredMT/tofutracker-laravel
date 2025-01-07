import AnimeRecommendedContent from "@/Components/Content/Shared/Anime/AnimeRecommendedContent";
import {AnimeBannerImageContainer} from "@/Components/Content/Shared/Anime/AnimeBannerImageContainer";
import ContentActions from "@/Components/ContentActions/ContentActions";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import {Head, usePage} from "@inertiajs/react";
import {Box, Divider, Space, Spoiler, Stack, Text, Title,} from "@mantine/core";
import {useViewportSize} from "@mantine/hooks";
import Seasons from "@/Components/Content/TV/Seasons/Seasons";
import {AnimeContentCredits} from "@/Components/Content/Shared/Anime/AnimeContentCredits";
import {Anime} from "@/types/anime";
import {AnimeContentSummary} from "@/Components/Content/Shared/Regular/AnimeContentSummary";
import AnimePosterImage from "@/Components/Content/Shared/Anime/AnimePosterImage";

function AnimeContent() {
    const { width } = useViewportSize();
    const { data } = usePage<{ data: Anime }>().props;
    return (
        <>
            <Head title={data.collection_name} />
            <AnimeBannerImageContainer />
            <ResponsiveContainer>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24}>
                            <AnimePosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {data.collection_name}
                                </Title>

                                {data.tmdbData.data.tagline && (
                                    <Text ta={"center"}>
                                        {data.tmdbData.data.tagline}
                                    </Text>
                                )}
                                <Space h={16} />
                                <AnimeContentSummary />
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
                                            {data.tmdbData.data.overview ??
                                                "No overview available"}
                                        </Text>
                                    </Spoiler>
                                </Stack>
                                <Space h={24} />
                                <AnimeContentCredits
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
                                <Title order={2}>
                                    {data.tmdbData.data.title}
                                </Title>
                                {data.tmdbData.data.tagline && (
                                    <Text>{data.tmdbData.data.tagline}</Text>
                                )}
                                <Divider my={16} />
                                <AnimeContentSummary />
                            </Stack>
                            <Stack mt={16}>
                                <Title order={3}>Overview</Title>
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>
                                        {data.tmdbData.data.overview ??
                                            "No overview available"}
                                    </Text>
                                </Spoiler>
                            </Stack>
                            <Space h={24} />
                            <AnimeContentCredits
                                containerWidth={width * 0.67}
                            />
                            <Divider my={16} />

                            <Seasons containerWidth={width * 0.67} />
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

AnimeContent.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default AnimeContent;
