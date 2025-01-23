import { useMemo } from "react";
import { Activity } from "./types";

export const useActivityPoster = (activity: Activity) => {
    return useMemo(() => {
        if (!activity.metadata.poster_path) return null;

        switch (activity.metadata.poster_from) {
            case "anidb":
                return (
                    "https://anidb.net/images/main/" +
                    activity.metadata.poster_path
                );
            case "tmdb":
                return (
                    "https://image.tmdb.org/t/p/w500" +
                    activity.metadata.poster_path
                );
            case "tvdb":
                return (
                    "https://artworks.thetvdb.com" +
                    activity.metadata.poster_path
                );
            default:
                return null;
        }
    }, [activity.metadata.poster_path, activity.metadata.poster_from]);
};
