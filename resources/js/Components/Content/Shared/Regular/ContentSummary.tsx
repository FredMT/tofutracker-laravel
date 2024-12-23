import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { PageProps, TvSeason } from "@/types";
import { getLanguageName } from "@/utils/formatter";
import { Badge, Box, Group, Paper, Space, Text } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import classes from "./ContentSummary.module.css";

export function ContentSummary() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();
    const { animeseason } = usePage<PageProps>().props;
    if (type === "animeseason" && animeseason) {
        return (
            <Paper
                p={16}
                className="border-y-2 border-gray-600 rounded-none"
                radius={0}
            >
                <Group
                    wrap="wrap"
                    gap={36}
                    preventGrowOverflow
                    className={classes.summaryGroup}
                >
                    {Number(animeseason.rating) > 0 && (
                        <Badge variant="outline">
                            {Number(animeseason.rating).toFixed(2)}
                        </Badge>
                    )}
                    {animeseason.type && <Text>{animeseason.type}</Text>}
                    {animeseason.startdate && (
                        <Text>{animeseason.startdate}</Text>
                    )}

                    {Object.keys(animeseason.mapped_episodes.mainEpisodes)
                        .length > 0 && (
                        <Text>
                            {
                                Object.keys(
                                    animeseason.mapped_episodes.mainEpisodes
                                ).length
                            }{" "}
                            Episodes
                        </Text>
                    )}
                    {animeseason.total_runtime && (
                        <Text>{animeseason.total_runtime}</Text>
                    )}
                </Group>
            </Paper>
        );
    }

    if (type === "animetv" || type === "animemovie") {
        // Handle anime content
        if (!animeContent) return null;
        const { tmdbData } = animeContent;

        return (
            <Paper
                p={16}
                className="border-y-2 border-gray-600 rounded-none"
                radius={0}
            >
                <Group wrap="wrap" gap={36} preventGrowOverflow>
                    {tmdbData.vote_average > 0 && (
                        <Badge variant="outline">
                            {tmdbData.vote_average.toFixed(2)}
                        </Badge>
                    )}
                    {tmdbData.original_language && (
                        <Text>
                            {getLanguageName(tmdbData.original_language)}
                        </Text>
                    )}
                    {tmdbData.certification && (
                        <Text>{tmdbData.certification}</Text>
                    )}
                </Group>
            </Paper>
        );
    }

    // Handle regular content
    if (!regularContent) return null;

    const date =
        type === "movie"
            ? regularContent.release_date
            : type === "tv"
            ? regularContent.first_air_date
            : (regularContent as TvSeason).air_date;

    return (
        <Paper
            p={16}
            className="border-y-2 border-gray-600 rounded-none"
            radius={0}
        >
            <Group wrap="wrap" gap={36} preventGrowOverflow>
                {regularContent.vote_average > 0 && (
                    <Badge variant="outline">
                        {regularContent.vote_average.toFixed(2)}
                    </Badge>
                )}
                {date && <Text>{date}</Text>}
                {regularContent.runtime && (
                    <Text>{regularContent.runtime}</Text>
                )}
                {regularContent.original_language && (
                    <Text>
                        {getLanguageName(regularContent.original_language)}
                    </Text>
                )}
                {regularContent.certification && (
                    <Text>{regularContent.certification}</Text>
                )}
            </Group>
        </Paper>
    );
}
