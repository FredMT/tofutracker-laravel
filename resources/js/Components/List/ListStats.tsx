import { BackgroundImage, Divider, Group, Stack, Text } from "@mantine/core";
import { ListPage } from "@/types/listPage";
import classes from "./ListStats.module.css";

interface ListStatsProps {
    list: ListPage;
}

export function ListStats({ list }: ListStatsProps) {
    const { stats, banner_image, banner_type } = list;

    return (
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
            className={classes.container}
        >
            <div className={classes.content}>
                <Group gap="md" justify="center" wrap="wrap">
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.total}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Total Items
                        </Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.movies}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Movies
                        </Text>
                    </Stack>
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.tv}
                        </Text>
                        <Text size="sm" c="dimmed">
                            TV Shows
                        </Text>
                    </Stack>
                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.anime}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Anime
                        </Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.average_rating ?? "-"}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Average Rating
                        </Text>
                    </Stack>

                    <Stack gap={0} align="center" className={classes.stat}>
                        <Text size="xl" fw={700}>
                            {stats.total_runtime}
                        </Text>
                        <Text size="sm" c="dimmed">
                            Total Runtime
                        </Text>
                    </Stack>
                </Group>
            </div>
        </BackgroundImage>
    );
}
