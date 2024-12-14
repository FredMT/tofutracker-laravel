import { useContent } from "@/hooks/useContent";
import { TvSeason } from "@/types";
import { getLanguageName } from "@/utils/formatter";
import { Badge, Group, Text } from "@mantine/core";

export function ContentSummary() {
    const { content, type } = useContent();
    if (!content) return null;

    const date =
        type === "movie"
            ? content.release_date
            : type === "tv"
            ? content.first_air_date
            : (content as TvSeason).air_date;

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
