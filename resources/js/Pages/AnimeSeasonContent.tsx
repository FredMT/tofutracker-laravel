import AnimeContentEpisodes from "@/Components/Content/Shared/Anime/AnimeContentEpisodes";
import AnimeRelatedContent from "@/Components/Content/Shared/Anime/AnimeRelatedContent";
import { BannerImageContainer } from "@/Components/Content/Shared/Regular/BannerImageContainer";
import ContentActions from "@/Components/ContentActions/ContentActions";
import { ContentCredits } from "@/Components/Content/Shared/Regular/ContentCredits";
import { ContentSummary } from "@/Components/Content/Shared/Regular/ContentSummary";
import PosterImage from "@/Components/Content/Shared/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import AnimeSeasonDetails from "@/Pages/AnimeSeasonDetails";
import { Head, usePage } from "@inertiajs/react";
import { Box, Divider, Space, Stack, Title } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import SeasonBreadcrumbs from "@/Components/Content/TV/Seasons/SeasonBreadcrumbs";
import { AnimeSeason } from "@/types/animeseason";

function AnimeSeasonContent() {
    const { animeseason } = usePage<{ animeseason: AnimeSeason }>().props;
    const { width } = useViewportSize();
    if (!animeseason) return null;

    return (
        <>
            <Head title={animeseason.title_main} />
            <BannerImageContainer />
            <ResponsiveContainer>
                <Box hiddenFrom="sm" mt={12}>
                    <SeasonBreadcrumbs />
                </Box>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="stretch">
                            <PosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {`${animeseason.title_main} (${
                                        animeseason.startdate &&
                                        animeseason.startdate.split(", ").pop()
                                    })`}
                                </Title>
                                <ContentSummary />
                            </Box>
                            <ContentActions />
                            <Box hiddenFrom="sm">
                                <Stack mt={16}></Stack>
                                <AnimeSeasonDetails />
                                <ContentCredits containerWidth={width * 0.95} />
                                <AnimeContentEpisodes />
                                <AnimeRelatedContent
                                    containerWidth={width * 0.95}
                                />
                            </Box>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <SeasonBreadcrumbs />
                                <Title order={2}>
                                    {`${animeseason.title_main} (${
                                        animeseason.startdate &&
                                        animeseason.startdate.split(", ").pop()
                                    })`}
                                </Title>
                                <ContentSummary />
                                <Space h={16} />
                                <AnimeSeasonDetails />
                            </Stack>
                            <ContentCredits containerWidth={width * 0.67} />
                            <AnimeContentEpisodes />
                            <Divider my={16} />
                            <AnimeRelatedContent
                                containerWidth={width * 0.67}
                            />
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}

AnimeSeasonContent.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default AnimeSeasonContent;
