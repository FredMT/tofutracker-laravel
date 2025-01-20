import {AnimeContentDataType, AnimeType} from "@/types";
import {getLanguageName} from "@/utils/formatter";
import {Badge, Group, Paper, Text} from "@mantine/core";
import {usePage} from "@inertiajs/react";
import classes from "./ContentSummary.module.css";
import {AnimeSeason} from "@/types/animeseason";
import {Anime} from "@/types/anime";


export function AnimeContentSummary() {
    const { type } = usePage<{type: AnimeType}>().props;
    let { data } = usePage<{data: AnimeContentDataType}>().props;

    if (type === "animeseason") {
        data = data as AnimeSeason;
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
                    {Number(data.rating) > 0 && (
                        <Badge variant="outline">
                            {Number(data.rating).toFixed(2)}
                        </Badge>
                    )}
                    {data.type && <Text>{data.type}</Text>}
                    {data.startdate && <Text>{data.startdate}</Text>}

                    {Object.keys(data.mapped_episodes.mainEpisodes).length >
                        0 && (
                        <Text>
                            {
                                Object.keys(data.mapped_episodes.mainEpisodes)
                                    .length
                            }{" "}
                            Episodes
                        </Text>
                    )}
                    {data.total_runtime && <Text>{data.total_runtime}</Text>}
                </Group>
            </Paper>
        );
    }

    data = data as Anime;

    return (
        <Paper
            p={16}
            className="border-y-2 border-gray-600 rounded-none"
            radius={0}
        >
            <Group wrap="wrap" gap={36} preventGrowOverflow>
                {data.tmdbData.data.vote_average > 0 && (
                    <Badge variant="outline">
                        {data.tmdbData.data.vote_average.toFixed(2)}
                    </Badge>
                )}
                {data.tmdbData.data.original_language && (
                    <Text>
                        {getLanguageName(data.tmdbData.data.original_language)}
                    </Text>
                )}
                {data.tmdbData.data.certification && (
                    <Text>{data.tmdbData.data.certification}</Text>
                )}
            </Group>
        </Paper>
    );
}
