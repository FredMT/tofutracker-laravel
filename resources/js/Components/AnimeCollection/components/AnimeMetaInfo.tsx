import { Text } from "@mantine/core";
import { Clock, ListOrdered, Star } from "lucide-react";
import classes from "../AnimeCollectionTable.module.css";

interface AnimeMetaInfoProps {
    year?: number | null;
    rating?: string | null;
    episode_count: number;
    runtime: number;
}

/**
 * Component to display metadata info for an anime entry
 */
export function AnimeMetaInfo({
    year,
    rating,
    episode_count,
    runtime,
}: AnimeMetaInfoProps) {
    return (
        <div className={classes.metaInfo}>
            {year && (
                <Text span className={classes.metaItem}>
                    Year: {year}
                </Text>
            )}
            {rating && (
                <span className={classes.metaItem}>
                    <Star size={14} fill="orange" />
                    {rating}
                </span>
            )}
            <span className={classes.metaItem}>
                <ListOrdered size={14} />
                {episode_count} ep
            </span>
            <span className={classes.metaItem}>
                <Clock size={14} />
                {Math.floor(runtime / 60)}h {runtime % 60}m
            </span>
        </div>
    );
}
