import AnimeContentEpisodes from "@/Components/Content/Shared/Anime/AnimeContentEpisodes";
import AnimeRelatedContent from "@/Components/Content/Shared/Anime/AnimeRelatedContent";
import {BannerImageContainer} from "@/Components/Content/Shared/Regular/BannerImageContainer";
import ContentActions from "@/Components/ContentActions/ContentActions";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import AnimeSeasonDetails from "@/Pages/AnimeSeasonDetails";
import {Head, usePage} from "@inertiajs/react";
import {Box, Divider, Space, Stack, Title} from "@mantine/core";
import {useViewportSize} from "@mantine/hooks";
import SeasonBreadcrumbs from "@/Components/Content/TV/Seasons/SeasonBreadcrumbs";
import {AnimeSeason} from "@/types/animeseason";
import AnimePosterImage from "@/Components/Content/Shared/Anime/AnimePosterImage";
import {AnimeContentSummary} from "@/Components/Content/Shared/Regular/AnimeContentSummary";

function AnimeSeasonContent() {
    const { data } = usePage<{ data: AnimeSeason }>().props;
    const { width } = useViewportSize();

    return (
        <>
            <Head title={data.title_main} />
            <BannerImageContainer />
            <ResponsiveContainer>
                <Box hiddenFrom="sm" mt={12}>
                    <SeasonBreadcrumbs />
                </Box>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="stretch">
                            <AnimePosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {`${data.title_main} (${
                                        data.startdate &&
                                        data.startdate.split(", ").pop()
                                    })`}
                                </Title>
                                <AnimeContentSummary />
                            </Box>
                            <ContentActions />
                            <Box hiddenFrom="sm">
                                <Stack mt={16}></Stack>
                                <AnimeSeasonDetails />
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
                                    {`${data.title_main} (${
                                        data.startdate &&
                                        data.startdate.split(", ").pop()
                                    })`}
                                </Title>
                                <AnimeContentSummary />
                                <Space h={16} />
                                <AnimeSeasonDetails />
                            </Stack>
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
