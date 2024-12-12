import { Badge, Group, Text } from "@mantine/core";
import { getLanguageName } from "@/utils/formatter";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export function ContentSummary() {
    const { type, movie, tv, anime, tvseason } = usePage<PageProps>().props;
    const content =
        type === "movie"
            ? movie
            : type === "tv"
            ? tv
            : type === "tvseason"
            ? tvseason
            : anime;
    if (!content) return null;

    const date =
        content.release_date || content.first_air_date || content.air_date;

    return (
        <Group wrap="wrap" gap={36} preventGrowOverflow>
            {content.vote_average > 0 && (
                <Badge variant="outline">
                    {content.vote_average.toFixed(2)}
                </Badge>
            )}
            {date && <Text>{date}</Text>}
            {content.runtime && <Text>{content.runtime}</Text>}
            {content.original_language && (
                <Text>{getLanguageName(content.original_language)}</Text>
            )}
            {content.certification && <Text>{content.certification}</Text>}
        </Group>
    );
}
