import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { TvSeason } from "@/types";
import { getLanguageName } from "@/utils/formatter";
import { Badge, Group, Text } from "@mantine/core";

export function ContentSummary() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();

    // Handle anime content
    if (type === "animetv" || type === "animemovie") {
        if (!animeContent) return null;
        const { tmdbData, isTV } = animeContent;

        return (
            <Group wrap="wrap" gap={36} preventGrowOverflow>
                {tmdbData.vote_average > 0 && (
                    <Badge variant="outline">
                        {tmdbData.vote_average.toFixed(2)}
                    </Badge>
                )}
                {tmdbData.original_language && (
                    <Text>{getLanguageName(tmdbData.original_language)}</Text>
                )}
                {tmdbData.certification && (
                    <Text>{tmdbData.certification}</Text>
                )}
            </Group>
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
        <Group wrap="wrap" gap={36} preventGrowOverflow>
            {regularContent.vote_average > 0 && (
                <Badge variant="outline">
                    {regularContent.vote_average.toFixed(2)}
                </Badge>
            )}
            {date && <Text>{date}</Text>}
            {regularContent.runtime && <Text>{regularContent.runtime}</Text>}
            {regularContent.original_language && (
                <Text>{getLanguageName(regularContent.original_language)}</Text>
            )}
            {regularContent.certification && (
                <Text>{regularContent.certification}</Text>
            )}
        </Group>
    );
}
