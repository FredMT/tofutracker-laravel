import { AnimeSeason } from "@/types/animeseason";
import { usePage } from "@inertiajs/react";
import {
    Button,
    Grid,
    Space,
    Spoiler,
    Stack,
    Tabs,
    Title,
} from "@mantine/core";
import { useState } from "react";
import { EpisodeCard } from "../../Episodes/EpisodeCard";

function AnimeContentEpisodes() {
    const { data } = usePage<{ data: AnimeSeason }>().props;

    if (!data?.mapped_episodes) return null;

    const { mainEpisodes, specialEpisodes } = data.mapped_episodes;

    const filteredMainEpisodes = Object.fromEntries(
        Object.entries(mainEpisodes).filter(
            ([_, episode]) => episode.name !== null
        )
    );

    const filteredSpecialEpisodes = Object.fromEntries(
        Object.entries(specialEpisodes).filter(
            ([_, episode]) => episode.name !== null
        )
    );

    const hasMainEpisodes = Object.keys(filteredMainEpisodes).length > 0;
    const hasSpecialEpisodes = Object.keys(filteredSpecialEpisodes).length > 0;

    const [mainVisibleCount, setMainVisibleCount] = useState(25);
    const [specialVisibleCount, setSpecialVisibleCount] = useState(25);

    const paginatedMainEpisodes = Object.fromEntries(
        Object.entries(filteredMainEpisodes).slice(0, mainVisibleCount)
    );

    const paginatedSpecialEpisodes = Object.fromEntries(
        Object.entries(filteredSpecialEpisodes).slice(0, specialVisibleCount)
    );

    const hasMoreMainEpisodes =
        Object.keys(filteredMainEpisodes).length > mainVisibleCount;
    const hasMoreSpecialEpisodes =
        Object.keys(filteredSpecialEpisodes).length > specialVisibleCount;

    if (!hasMainEpisodes && !hasSpecialEpisodes) return null;

    return (
        <Stack my={16}>
            <Title order={3}>Episodes</Title>
            <Tabs defaultValue="main">
                <Tabs.List>
                    {hasMainEpisodes && (
                        <Tabs.Tab value="main">Main Episodes</Tabs.Tab>
                    )}
                    {hasSpecialEpisodes && (
                        <Tabs.Tab value="special">Special Episodes</Tabs.Tab>
                    )}
                </Tabs.List>

                <Spoiler
                    maxHeight={1000}
                    showLabel="Show more"
                    hideLabel="Show less"
                    styles={{
                        control: {
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px",
                        },
                    }}
                >
                    {hasMainEpisodes && (
                        <Tabs.Panel value="main">
                            <Stack mt="md">
                                <Grid
                                    type="container"
                                    breakpoints={{
                                        xs: "500px",
                                        sm: "500px",
                                        md: "700px",
                                        lg: "900px",
                                        xl: "1024px",
                                    }}
                                    gutter={{ base: 12 }}
                                >
                                    {Object.entries(paginatedMainEpisodes).map(
                                        ([number, episode]) => (
                                            <EpisodeCard
                                                key={`main-${number}`}
                                                episode={episode}
                                                imageSource="tvdb"
                                                type="anime"
                                            />
                                        )
                                    )}
                                </Grid>
                                {hasMoreMainEpisodes && (
                                    <Button
                                        onClick={() =>
                                            setMainVisibleCount(
                                                (prev) => prev + 25
                                            )
                                        }
                                        className="text-blue-500 hover:underline"
                                    >
                                        Show more episodes
                                    </Button>
                                )}
                            </Stack>
                            <Space h={16} />
                        </Tabs.Panel>
                    )}

                    {hasSpecialEpisodes && (
                        <>
                            <Tabs.Panel value="special">
                                <Stack mt="md">
                                    <Grid
                                        type="container"
                                        breakpoints={{
                                            xs: "500px",
                                            sm: "500px",
                                            md: "700px",
                                            lg: "900px",
                                            xl: "1024px",
                                        }}
                                        gutter={{ base: 12 }}
                                    >
                                        {Object.entries(
                                            paginatedSpecialEpisodes
                                        ).map(([number, episode]) => (
                                            <EpisodeCard
                                                key={`special-${number}`}
                                                episode={episode}
                                                imageSource="tvdb"
                                                type="anime"
                                            />
                                        ))}
                                    </Grid>
                                    {hasMoreSpecialEpisodes && (
                                        <Button
                                            onClick={() =>
                                                setSpecialVisibleCount(
                                                    (prev) => prev + 25
                                                )
                                            }
                                            className="text-blue-500 hover:underline"
                                        >
                                            Show more episodes
                                        </Button>
                                    )}
                                </Stack>
                            </Tabs.Panel>
                        </>
                    )}
                </Spoiler>
            </Tabs>
        </Stack>
    );
}

export default AnimeContentEpisodes;
