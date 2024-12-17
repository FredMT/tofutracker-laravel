import ContentEpisodeCard from "@/Components/ContentEpisodeCard";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Spoiler, Stack, Tabs, Title } from "@mantine/core";

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

                {hasMainEpisodes && (
                    <Spoiler
                        maxHeight={600}
                        showLabel="Show more"
                        hideLabel="Show less"
                    >
                        <Tabs.Panel value="main">
                            <Stack mt="md">
                                {Object.entries(filteredMainEpisodes).map(
                                    ([number, episode]) => (
                                        <ContentEpisodeCard
                                            key={`main-${number}`}
                                            episode={episode}
                                            imageSource="tvdb"
                                        />
                                    )
                                )}
                            </Stack>
                        </Tabs.Panel>
                    </Spoiler>
                )}

                {hasSpecialEpisodes && (
                    <Spoiler
                        maxHeight={600}
                        showLabel="Show more"
                        hideLabel="Show less"
                    >
                        <Tabs.Panel value="special">
                            <Stack mt="md">
                                {Object.entries(filteredSpecialEpisodes).map(
                                    ([number, episode]) => (
                                        <ContentEpisodeCard
                                            key={`main-${number}`}
                                            episode={episode}
                                            imageSource="tvdb"
                                        />
                                    )
                                )}
                            </Stack>
                        </Tabs.Panel>
                    </Spoiler>
                )}
            </Tabs>
        </Stack>
    );
}

export default AnimeContentEpisodes;
