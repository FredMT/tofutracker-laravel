import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import {Movie, PageProps, RegularContentDataType, RegularType, TvSeason, TvShow} from "@/types";
import { getLanguageName } from "@/utils/formatter";
import { Badge, Box, Group, Paper, Space, Text } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import classes from "./ContentSummary.module.css";

export function RegularContentSummary() {

    const {type, data} = usePage<{type: RegularType, data: RegularContentDataType}>().props
    const date =
        type === "movie"
            ? (data as Movie).release_date
            : type === "tv"
            ? (data as TvShow).first_air_date
            : (data as TvSeason).air_date;

    return (
        <Paper
            p={16}
            className="border-y-2 border-gray-600 rounded-none"
            radius={0}
        >
            <Group wrap="wrap" gap={36} preventGrowOverflow>
                {data.vote_average > 0 && (
                    <Badge variant="outline">
                        {data.vote_average.toFixed(2)}
                    </Badge>
                )}
                {date && <Text>{date}</Text>}
                {data.runtime && (
                    <Text>{data.runtime}</Text>
                )}
                {data.original_language && (
                    <Text>
                        {getLanguageName(data.original_language)}
                    </Text>
                )}
                {data.certification && (
                    <Text>{data.certification}</Text>
                )}
            </Group>
        </Paper>
    );
}
