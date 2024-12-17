import ContentEpisodeCard from "@/Components/ContentEpisodeCard";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Button, Space, Spoiler, Stack, Tabs, Title } from "@mantine/core";
import { useState } from "react";

function AnimeContentEpisodes() {
    const { animeseason } = usePage<PageProps>().props;

    if (!animeseason?.mapped_episodes) return null;

    const { mainEpisodes, specialEpisodes } = animeseason.mapped_episodes;

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
                                {Object.entries(paginatedMainEpisodes).map(
                                    ([number, episode]) => (
                                        <ContentEpisodeCard
                                            key={`main-${number}`}
                                            episode={episode}
                                            imageSource="tvdb"
                                        />
                                    )
                                )}
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
                                    {Object.entries(
                                        paginatedSpecialEpisodes
                                    ).map(([number, episode]) => (
                                        <ContentEpisodeCard
                                            key={`special-${number}`}
                                            episode={episode}
                                            imageSource="tvdb"
                                        />
                                    ))}
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
