import {
    Anchor,
    Box,
    Breadcrumbs,
    Group,
    Menu,
    Text,
    Tooltip,
} from "@mantine/core";
import { Link, usePage } from "@inertiajs/react";
import { Links, ContentType } from "@/types";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import classes from "./SeasonBreadcrumbs.module.css";

export default function SeasonBreadcrumbs() {
    const { links, type } = usePage<{ type: ContentType; links: Links }>()
        .props;

    if (!links || (type !== "tvseason" && type !== "animeseason")) return null;

    const currentSeasonIndex = links.seasons.findIndex(
        (season) => season.is_current
    );
    const previousSeason =
        currentSeasonIndex > 0 ? links.seasons[currentSeasonIndex - 1] : null;
    const nextSeason =
        currentSeasonIndex < links.seasons.length - 1
            ? links.seasons[currentSeasonIndex + 1]
            : null;
    const currentSeason = links.seasons[currentSeasonIndex];

    const getSeasonName = (season: Links["seasons"][0], isDropdown = false) => {
        if (isDropdown) {
            if (type === "animeseason") {
                const truncatedName =
                    season.name.length > 50
                        ? `${season.name.slice(0, 50)}...`
                        : season.name;
                return `Season ${season.season_number} - ${truncatedName}`;
            }
            return season.name;
        }
        return `Season ${season.season_number}`;
    };

    const items = [
        <Link href={links.show.url} key="show" prefetch>
            <Text className={classes.seasonBreadcrumbs}>
                {links.show.name ??
                    (type === "animeseason" ? "Anime" : "TV Show")}
            </Text>
        </Link>,
        links.seasons.length > 1 ? (
            <Menu
                key="season"
                trigger="click-hover"
                openDelay={100}
                closeDelay={200}
            >
                <Box style={{ cursor: "pointer" }}>
                    <Menu.Target>
                        <Group gap={4}>
                            <Text className={classes.seasonBreadcrumbs}>
                                {getSeasonName(currentSeason)}
                            </Text>
                            <ChevronDown size={16} />
                        </Group>
                    </Menu.Target>
                </Box>
                <Menu.Dropdown maw="95%">
                    {links.seasons.map((season) => (
                        <Menu.Item
                            key={season.url}
                            component={Link}
                            href={season.url}
                            prefetch
                            disabled={season.is_current}
                            rightSection={
                                season.is_current && (
                                    <Box
                                        w={6}
                                        h={6}
                                        style={{
                                            borderRadius: "50%",
                                            backgroundColor:
                                                "var(--mantine-primary-color-filled)",
                                        }}
                                    />
                                )
                            }
                        >
                            <Tooltip label={season.name}>
                                <Text className={classes.seasonBreadcrumbs}>
                                    {getSeasonName(season, true)}
                                </Text>
                            </Tooltip>
                        </Menu.Item>
                    ))}
                </Menu.Dropdown>
            </Menu>
        ) : (
            <Text key="season" className={classes.seasonBreadcrumbs}>
                {getSeasonName(currentSeason)}
            </Text>
        ),
        links.seasons.length > 1 && (
            <Group gap={2} key="navigation">
                {previousSeason && (
                    <Link href={previousSeason.url}>
                        <Text className={classes.seasonBreadcrumbs}>
                            <ChevronLeft size={20} />
                        </Text>
                    </Link>
                )}
                {nextSeason && (
                    <Link href={nextSeason.url}>
                        <Text className={classes.seasonBreadcrumbs}>
                            <ChevronRight size={20} />
                        </Text>
                    </Link>
                )}
            </Group>
        ),
    ];

    return (
        <Group align="center">
            <Breadcrumbs>{items}</Breadcrumbs>
        </Group>
    );
}
