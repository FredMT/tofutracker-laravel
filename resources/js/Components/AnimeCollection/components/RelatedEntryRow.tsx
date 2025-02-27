import { Box, Text } from "@mantine/core";
import { AnimeRelatedEntry } from "../types/animeCollections";
import { formatPosterUrl } from "../utils/animeUtils";
import { AnimeMetaInfo } from "./AnimeMetaInfo";
import classes from "../AnimeCollectionTable.module.css";

/**
 * Component to define columns for related entries
 */
export function RelatedEntryRow() {
    // Define columns for the related entries
    const columns = [
        {
            accessor: "title",
            title: "Anime",
            render: ({ title, anidb_poster }: AnimeRelatedEntry) => (
                <Box ml={20} className={classes.titleCell}>
                    <img
                        src={formatPosterUrl(anidb_poster, false)}
                        alt={title}
                        className={classes.poster}
                    />
                    <Text>{title}</Text>
                </Box>
            ),
        },
        {
            accessor: "metaInfo",
            title: "Information",
            render: ({
                year,
                rating,
                episode_count,
                runtime,
            }: AnimeRelatedEntry) => (
                <AnimeMetaInfo
                    year={year}
                    rating={rating}
                    episode_count={episode_count}
                    runtime={runtime}
                />
            ),
        },
    ];

    return { columns };
}
