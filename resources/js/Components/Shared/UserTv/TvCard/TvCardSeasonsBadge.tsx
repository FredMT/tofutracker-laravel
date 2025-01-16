import {UserTvShow} from "@/types/userTv";
import {Badge, Card, Group, Space, Text} from "@mantine/core";
import {ExternalLink} from "lucide-react";
import classes from "./TvCard.module.css";

interface TvCardSeasonsBadgeProps {
    show: UserTvShow;
    showSeasons: boolean;
    onClick: () => void;
}

export function TvCardSeasonsBadge({
    show,
    showSeasons,
    onClick,
}: TvCardSeasonsBadgeProps) {
    return (
        <Card.Section>
            <Badge
                bg="violet.9"
                py={12}
                radius="sm"
                style={{ cursor: "pointer" }}
                onClick={onClick}
            >
                <Group justify="space-between" w="100%" wrap="nowrap">
                    <Space w={0} />
                    <Text size="xs">
                        {show.user_total_seasons}/{show.total_seasons} Seasons
                    </Text>
                    <ExternalLink
                        size={14}
                        className={`${classes.chevron} ${
                            showSeasons
                                ? classes.chevronUp
                                : classes.chevronDown
                        }`}
                    />
                </Group>
            </Badge>
        </Card.Section>
    );
}

export default TvCardSeasonsBadge;
