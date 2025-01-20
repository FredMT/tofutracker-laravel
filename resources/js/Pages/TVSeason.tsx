import ContentActions from "@/Components/ContentActions/ContentActions";
import {RegularContentSummary} from "@/Components/Content/Shared/Regular/RegularContentSummary";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import {TvSeason} from "@/types";
import {Head, usePage} from "@inertiajs/react";
import {Box, Divider, Space, Spoiler, Stack, Text, Title,} from "@mantine/core";
import {useViewportSize} from "@mantine/hooks";
import ContentEpisodes from "@/Components/Content/Episodes/ContentEpisodes";
import SeasonBreadcrumbs from "@/Components/Content/TV/Seasons/SeasonBreadcrumbs";
import {RegularContentCredits} from "@/Components/Content/Shared/Regular/RegularContentCredits";
import RegularPosterImage from "@/Components/Content/Shared/Regular/RegularPosterImage";
import {RegularBannerImageContainer} from "@/Components/Content/Shared/Regular/RegularBannerImageContainer";

function TVSeason() {
    const { width } = useViewportSize();
    const { data } = usePage<{ data: TvSeason }>().props;
    return (
        <>
            <Head title={data.title} />
            <RegularBannerImageContainer />
            <ResponsiveContainer>
                <Box hiddenFrom="sm" mt={12}>
                    <SeasonBreadcrumbs />
                </Box>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="center">
                            <RegularPosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {data.title} ({data.year})
                                </Title>
                                <Space h={8} />
                                {data.tagline && (
                                    <Text ta={"center"}>{data.tagline}</Text>
                                )}
                                <Space h={16} />
                                <RegularContentSummary />
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
                                            {data.overview ??
                                                "No overview available"}
                                        </Text>
                                    </Spoiler>
                                </Stack>
                                <Space h={24} />
                                <RegularContentCredits
                                    containerWidth={width * 0.95}
                                />
                                <ContentEpisodes />
                                <Divider my={16} />
                            </Box>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <SeasonBreadcrumbs />
                                <Title order={2}>
                                    {data.title} ({data.year})
                                </Title>
                                <Text>{data.tagline}</Text>
                                <RegularContentSummary />
                            </Stack>
                            <Stack mt={16}>
                                <Title order={3}>Overview</Title>
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>
                                        {data.overview ??
                                            "No overview available"}
                                    </Text>
                                </Spoiler>
                            </Stack>
                            <Space h={24} />
                            <RegularContentCredits
                                containerWidth={width * 0.67}
                            />
                            <ContentEpisodes />
                            <Divider my={16} />
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}
TVSeason.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default TVSeason;
