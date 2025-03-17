import ContentActions from "@/Components/ContentActions/ContentActions";
import ContentDetails from "@/Components/Content/Shared/Regular/ContentDetails";
import { RegularContentSummary } from "@/Components/Content/Shared/Regular/RegularContentSummary";
import ResponsiveContainer from "@/Components/ResponsiveContainer";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import { TvShow } from "@/types";
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
import Seasons from "@/Components/Content/TV/Seasons/Seasons";
import SeasonBreadcrumbs from "@/Components/Content/TV/Seasons/SeasonBreadcrumbs";
import { RegularContentCredits } from "@/Components/Content/Shared/Regular/RegularContentCredits";
import { RegularBannerImageContainer } from "@/Components/Content/Shared/Regular/RegularBannerImageContainer";
import RegularPosterImage from "@/Components/Content/Shared/Regular/RegularPosterImage";
import RecommendedContent from "@/Components/Content/Shared/RecommendedContent";
import Comments from "@/Components/Comments/Comments";
import Trailer from "@/Components/Content/TV/Trailer";

function TV() {
    const { width } = useViewportSize();
    const { data } = usePage<{ data: TvShow }>().props;
    return (
        <>
            <Head title={data.title} />
            <Space h={64} />
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
                            <Stack>
                                {data.trailer && (
                                    <Trailer trailer={data.trailer} />
                                )}
                                <ContentActions />
                            </Stack>
                            <Box hiddenFrom="sm">
                                <ContentDetails />
                                <Divider my={16} />
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
                                <Divider my={16} />
                                <Seasons containerWidth={width * 0.95} />
                                <Divider my={16} />
                                <RecommendedContent
                                    containerWidth={width * 0.95}
                                />
                                <Divider my={16} />
                                <Comments />
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
                            <ContentDetails />
                            <Divider my={16} />
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
                            <Divider my={16} />
                            <Seasons containerWidth={width * 0.67} />
                            <Divider my={16} />
                            <RecommendedContent containerWidth={width * 0.67} />
                            <Divider my={16} />
                            <Comments />
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}

TV.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default TV;
