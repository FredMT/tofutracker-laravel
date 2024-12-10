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

type Props = PageProps;

function getContent(props: Props) {
    const { type, movie, tv, anime } = props;
    switch (type) {
        case "movie":
            return movie;
        case "tv":
            return tv;
        case "anime":
            return anime;
        default:
            return null;
    }
}

export default function Content(props: Props) {
    const { width } = useViewportSize();
    const content = getContent(props);
    if (!content) return null;
    return (
        <>
            <Head title={content.title} />
            <ThemeButton />
            <ContentBanner />
            <ResponsiveContainer>
                <Space h={24} />
                <ContentLayout
                    left={
                        <Stack gap={24} align="center">
                            <PosterImage
                                src={`https://image.tmdb.org/t/p/original${content.poster_path}`}
                                alt={content.title}
                                fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                            />
                            <Box hiddenFrom="sm">
                                <Title order={2} ta="center">
                                    {content.title} ({content.year})
                                </Title>

                                <Text ta={"center"}>{content.tagline}</Text>
                                <Divider my={16} />
                                <ContentSummary />
                                <Divider my={16} />
                            </Box>
                            <ContentActions />
                            <Box hiddenFrom="sm">
                                <ContentDetails />

                                <Divider my={16} />
                                <Stack mt={16}>
                                    <Title order={4}>Overview</Title>
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
                                <Divider my={16} />
                                <ContentCredits containerWidth={width * 0.95} />
                                <Divider my={16} />
                                {content.type === "tv" && (
                                    <Seasons containerWidth={width * 0.67} />
                                )}
                                <Divider my={16} />
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
                                <Divider my={8} />
                                <ContentSummary />

                                <Divider my={8} />
                            </Stack>
                            <ContentDetails />
                            <Divider my={16} />
                            <Stack mt={16}>
                                <Title order={4}>Overview</Title>
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
                            <Space h={16} />
                            <ContentCredits containerWidth={width * 0.67} />
                            <Divider my={16} />
                            <Seasons containerWidth={width * 0.67} />
                            <Divider my={16} />
                            <SimilarContent containerWidth={width * 0.67} />
                        </Box>
                    }
                />
            </ResponsiveContainer>
        </>
    );
}
