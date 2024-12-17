import { BannerImageContainer } from "@/Components/BannerImageContainer";
import { ContentActions } from "@/Components/ContentActions/ContentActions";
import { ContentCredits } from "@/Components/ContentCredits";
import ContentDetails from "@/Components/ContentDetails";
import ContentEpisodes from "@/Components/ContentEpisodes";
import { ContentSummary } from "@/Components/ContentSummary";
import PosterImage from "@/Components/PosterImage";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import SimilarContent from "@/Components/SimilarContent";
import ThemeButton from "@/Components/ThemeButton";
import Seasons from "@/Components/TV/Seasons/Seasons";
import { useContent } from "@/hooks/useContent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
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

export default function Content(props: PageProps) {
    const { width } = useViewportSize();
    const { content, type } = useContent();
    if (!content) return null;
    return (
        <>
            <Head title={content.title} />
            <AuthenticatedLayout>
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

                                    {content.tagline && (
                                        <Text ta={"center"}>
                                            {content.tagline}
                                        </Text>
                                    )}
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
                                    <ContentCredits
                                        containerWidth={width * 0.95}
                                    />
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
                                    <SimilarContent
                                        containerWidth={width * 0.95}
                                    />
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
                                        <Seasons
                                            containerWidth={width * 0.67}
                                        />
                                        <Divider my={16} />
                                    </>
                                )}
                                {type !== "tvseason" && (
                                    <SimilarContent
                                        containerWidth={width * 0.67}
                                    />
                                )}
                            </Box>
                        }
                    />
                </ResponsiveContainer>
            </AuthenticatedLayout>
        </>
    );
}
