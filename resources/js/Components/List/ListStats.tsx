import { BackgroundImage, Group, Stack, Text } from "@mantine/core";
import { ListPage } from "@/types/listPage";
import classes from "./ListStats.module.css";

interface ListStatsProps {
    list: ListPage;
}

export function ListStats({ list }: ListStatsProps) {
    const { stats, banner_image, banner_type } = list;

    return (
        <div className={classes.container}>
            <BackgroundImage
                src={
                    banner_image
                        ? `${
                              banner_type === "tmdb"
                                  ? "https://image.tmdb.org/t/p/w780"
                                  : "https://images.tofutracker.com/"
                          }${banner_image}`
                        : ""
                }
                style={{ position: "absolute", inset: 0 }}
            />
            <div className={classes.backgroundOverlay} />
            <div className={classes.content}>
                <Group gap="md" justify="center" wrap="wrap">
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.total}
                        </Text>
                        <Text size="sm">Total Items</Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.movies}
                        </Text>
                        <Text size="sm">Movies</Text>
                    </Stack>
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.tv}
                        </Text>
                        <Text size="sm">TV Shows</Text>
                    </Stack>
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.anime}
                        </Text>
                        <Text size="sm">Anime</Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.average_rating ?? "-"}
                        </Text>
                        <Text size="sm">Average Rating</Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.total_runtime}
                        </Text>
                        <Text size="sm">Total Runtime</Text>
                    </Stack>
                </Group>
            </div>
        </div>
    );
}
