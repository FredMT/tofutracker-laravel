import AnimeContentEpisodes from "@/Components/AnimeContentEpisodes";
import AnimeRelatedContent from "@/Components/AnimeRelatedContent";
import { BannerImageContainer } from "@/Components/BannerImageContainer";
import { ContentActions } from "@/Components/ContentActions/ContentActions";
import { ContentCredits } from "@/Components/ContentCredits";
import { ContentSummary } from "@/Components/ContentSummary";
import PosterImage from "@/Components/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import AnimeSeasonDetails from "@/Pages/AnimeSeasonDetails";
import { PageProps } from "@/types";
import { Head, usePage } from "@inertiajs/react";
import { Box, Divider, Space, Stack, Title } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";

export default function AnimeSeasonContent() {
    const { width } = useViewportSize();
    const { animeseason } = usePage<PageProps>().props;
    if (!animeseason) return null;
    return (
        <>
            <Head title={animeseason.title_main} />
            <AuthenticatedLayout>
                <BannerImageContainer />
                <ResponsiveContainer>
                    <Space h={24} />
                    <ContentLayout
                        left={
                            <Stack gap={24} align="stretch">
                                <PosterImage />
                                <Box hiddenFrom="sm">
                                    <Title order={2} ta="center">
                                        {`${animeseason.title_main} (${
                                            animeseason.startdate &&
                                            animeseason.startdate
                                                .split(", ")
                                                .pop()
                                        })`}
                                    </Title>
                                    <ContentSummary />
                                </Box>
                                <ContentActions />
                                <Box hiddenFrom="sm">
                                    <Stack mt={16}></Stack>
                                    <AnimeSeasonDetails />
                                    <ContentCredits
                                        containerWidth={width * 0.95}
                                    />
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
                                    <Title order={2}>
                                        {`${animeseason.title_main} (${
                                            animeseason.startdate &&
                                            animeseason.startdate
                                                .split(", ")
                                                .pop()
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
            </AuthenticatedLayout>
        </>
    );
}