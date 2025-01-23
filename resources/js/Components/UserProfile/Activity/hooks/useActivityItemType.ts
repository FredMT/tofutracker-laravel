import { useMemo } from "react";
import { Activity } from "@/Components/UserProfile/Activity/activityType";
export const useActivityItemType = (activity: Activity) => {
    return useMemo(() => {
        if (activity.activity_type === "movie_watch") return "movie";
        if (activity.activity_type === "custom_list_created")
            return "custom_list";
        if (
            (activity.activity_type === "tv_watch" ||
                activity.activity_type === "anime_watch") &&
            activity.metadata.type
        ) {
            return activity.metadata.type;
        }
        return null;
    }, [activity.activity_type, activity.metadata.type]);
};
