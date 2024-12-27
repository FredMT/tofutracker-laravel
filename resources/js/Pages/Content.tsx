import { BannerImageContainer } from "@/Components/Content/Shared/Regular/BannerImageContainer";
import ContentActions from "@/Components/ContentActions/ContentActions";
import { ContentCredits } from "@/Components/Content/Shared/Regular/ContentCredits";
import ContentDetails from "@/Components/Content/Shared/Regular/ContentDetails";
import { ContentSummary } from "@/Components/Content/Shared/Regular/ContentSummary";
import PosterImage from "@/Components/Content/Shared/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import SimilarContent from "@/Components/Content/Shared/SimilarContent";
import { useContent } from "@/hooks/useContent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout/AuthenticatedLayout";
import ContentLayout from "@/Layouts/ContentLayout";
import { PageProps } from "@/types";
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
import ContentEpisodes from "@/Components/Content/Episodes/ContentEpisodes";
import Seasons from "@/Components/Content/TV/Seasons/Seasons";

function Content(props: PageProps) {
    const { width } = useViewportSize();
    const { content, type } = useContent();
    if (!content) return null;
    return (
        <>
            <Head title={content.title} />
            <BannerImageContainer />
            <ResponsiveContainer>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="center">
                            <PosterImage />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {content.title} ({content.year})
                                </Title>
                                <Space h={8} />

                                {content.tagline && (
                                    <Text ta={"center"}>{content.tagline}</Text>
                                )}
                                <Space h={16} />
                                <ContentSummary />
                            </Box>
                            <ContentActions />
                            <Box hiddenFrom="sm">
                                {type !== "tvseason" && (
                                    <>
                                        <ContentDetails />
                                        <Divider my={16} />
                                    </>
                                )}

                                <Stack mt={16}>
                                    <Title order={3}>Overview</Title>
                                    <Spoiler
                                        maxHeight={120}
                                        showLabel="Show more"
                                        hideLabel="Hide"
                                    >
                                        <Text>
                                            {content.overview ??
                                                "No overview available"}
                                        </Text>
                                    </Spoiler>
                                </Stack>
                                <Space h={24} />
                                <ContentCredits containerWidth={width * 0.95} />
                                <ContentEpisodes />

                                <Divider my={16} />
                                {type === "tv" && (
                                    <>
                                        <Seasons
                                            containerWidth={width * 0.95}
                                        />
                                        <Divider my={16} />
                                    </>
                                )}
                                <SimilarContent containerWidth={width * 0.95} />
                            </Box>
                        </Stack>
                    }
                    right={
                        <Box visibleFrom="sm">
                            <Stack gap={8}>
                                <Title order={2}>
                                    {content.title} ({content.year})
                                </Title>
                                <Text>{content.tagline}</Text>
                                <ContentSummary />
                            </Stack>
                            {type !== "tvseason" && (
                                <>
                                    <ContentDetails />
                                    <Divider my={16} />
                                </>
                            )}
                            <Stack mt={16}>
                                <Title order={3}>Overview</Title>
                                <Spoiler
                                    maxHeight={120}
                                    showLabel="Show more"
                                    hideLabel="Hide"
                                >
                                    <Text>
                                        {content.overview ??
                                            "No overview available"}
                                    </Text>
                                </Spoiler>
                            </Stack>
                            <Space h={24} />
                            <ContentCredits containerWidth={width * 0.67} />
                            <ContentEpisodes />
                            <Divider my={16} />
                            {type === "tv" && (
                                <>
                                    <Seasons containerWidth={width * 0.67} />
                                    <Divider my={16} />
                                </>
                            )}
                            {type !== "tvseason" && (
                                <SimilarContent containerWidth={width * 0.67} />
                            )}
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}
Content.layout = (page: any) => (
    <AuthenticatedLayout>{page}</AuthenticatedLayout>
);

export default Content;
