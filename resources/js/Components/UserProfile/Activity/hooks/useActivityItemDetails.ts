import { useMemo } from "react";
import { Activity } from "@/Components/UserProfile/Activity/activityType";
import { useActivityItemType } from "./useActivityItemType";

export const useActivityItemDetails = (activity: Activity) => {
    const itemType = useActivityItemType(activity);

    const itemLink = useMemo(() => {
        switch (itemType) {
            case "movie":
                return activity.metadata.movie_link || null;
            case "tv_episode":
            case "tv_season":
                return activity.metadata.season_link || null;
            case "tv_show":
                return activity.metadata.show_link || null;
            case "anime_episode":
            case "anime_season":
                return activity.metadata.anime_link || null;
            case "custom_list":
                return `/list/${activity.metadata.list_id}` || null;
            default:
                return null;
        }
    }, [itemType, activity.metadata]);

    const itemTitle = useMemo(() => {
        switch (itemType) {
            case "movie":
                return activity.metadata.movie_title || null;
            case "tv_episode":
            case "tv_season":
                return activity.metadata.season_title || null;
            case "tv_show":
                return activity.metadata.show_title || null;
            case "anime_episode":
            case "anime_season":
                return activity.metadata.anime_title || null;
            case "custom_list":
                return activity.metadata.list_title || null;
            default:
                return null;
        }
    }, [itemType, activity.metadata]);

    return { itemLink, itemTitle };
};
