import { Badge, Group } from "@mantine/core";
import { X } from "lucide-react";
import { useScheduleFilterStore } from "./store/useScheduleFilterStore";

interface ScheduleTypeFilterBadgesProps {
    interactive?: boolean;
}

const ScheduleTypeFilterBadges = ({
    interactive = false,
}: ScheduleTypeFilterBadgesProps) => {
    const { activeFilter, setFilter, isTvActive, isAnimeActive } =
        useScheduleFilterStore();

    const handleTvClick = () => {
        if (!interactive) return;
        setFilter(activeFilter === "tv" ? null : "tv");
    };

    const handleAnimeClick = () => {
        if (!interactive) return;
        setFilter(activeFilter === "anime" ? null : "anime");
    };

    return (
        <Group>
            <Badge
                variant={isTvActive() ? "filled" : "outline"}
                size="lg"
                color="teal"
                leftSection={isTvActive() ? <X size={16} /> : null}
                style={interactive ? { cursor: "pointer" } : undefined}
                onClick={handleTvClick}
            >
                TV Shows
            </Badge>
            <Badge
                variant={isAnimeActive() ? "filled" : "outline"}
                size="lg"
                color="grape"
                leftSection={isAnimeActive() ? <X size={16} /> : null}
                style={interactive ? { cursor: "pointer" } : undefined}
                onClick={handleAnimeClick}
            >
                Anime
            </Badge>
        </Group>
    );
};

export default ScheduleTypeFilterBadges;
