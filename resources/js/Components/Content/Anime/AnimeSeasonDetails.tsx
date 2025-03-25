import {usePage} from "@inertiajs/react";
import {Box, Group, Image, SimpleGrid, Space, Spoiler, Tabs, Text,} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import classes from "./AnimeSeasonDetails.module.css";
import {externalLinkMapping} from "@/utils/externalLinkMapping";
import {AnimeSeason} from "@/types/animeseason";

function AnimeSeasonDetails() {
    const isMobile = useMediaQuery("(max-width: 900px)");
    const { data } = usePage<{ data: AnimeSeason }>().props;
    if (!data) return null;

    const titles = [
        { label: "English", value: data.title_en },
        { label: "Japanese", value: data.title_ja },
        { label: "Korean", value: data.title_ko },
        { label: "Chinese", value: data.title_zh },
    ].filter((title) => title.value);

    return (
        <Tabs
            defaultValue={"details"}
            orientation={isMobile ? "horizontal" : "vertical"}
            variant="outline"
        >
            <Tabs.List>
                <Tabs.Tab value="details">Details</Tabs.Tab>
                <Tabs.Tab value="titles">Titles</Tabs.Tab>
                <Tabs.Tab value="creators">Creators</Tabs.Tab>
                <Tabs.Tab value="external_links">External Links</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="details" mih={200}>
                <Box px="md">
                    <Space h={16} hiddenFrom="smlg" />
                    <Spoiler
                        maxHeight={200}
                        showLabel="Show more"
                        hideLabel="Hide"
                    >
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                            <Box>
                                <Text size="sm" c="dimmed">
                                    Type
                                </Text>
                                <Text>{data.type}</Text>
                            </Box>

                            <Box>
                                <Text size="sm" c="dimmed">
                                    Episodes
                                </Text>
                                <Text>{data.episode_count}</Text>
                            </Box>
                            <Box>
                                <Text size="sm" c="dimmed">
                                    Aired
                                </Text>
                                <Text>
                                    {data.startdate} to{" "}
                                    {data.enddate}
                                </Text>
                            </Box>

                            <Box>
                                <Text size="sm" c="dimmed">
                                    Number of Votes
                                </Text>
                                <Text>
                                    {data.rating_count.toLocaleString()}
                                </Text>
                            </Box>

                            <Box>
                                <Text size="sm" c="dimmed">
                                    Homepage
                                </Text>
                                <Text
                                    component="a"
                                    href={data.homepage}
                                    target="_blank"
                                >
                                    {data.homepage}
                                </Text>
                            </Box>
                        </SimpleGrid>
                    </Spoiler>
                </Box>
            </Tabs.Panel>
            <Tabs.Panel value="titles" mih={200}>
                <Box px="md">
                    <Space h={16} hiddenFrom="smlg" />
                    <Spoiler
                        maxHeight={200}
                        showLabel="Show more"
                        hideLabel="Hide"
                    >
                        <SimpleGrid
                            cols={{ base: 1, sm: 2 }}
                            spacing={{ base: "sm", sm: "lg" }}
                            verticalSpacing={{ base: "sm", sm: "lg" }}
                        >
                            {titles.map(({ label, value }) => (
                                <Box key={label}>
                                    <Text size="sm" c="dimmed">
                                        {label}
                                    </Text>
                                    <Text>{value}</Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Spoiler>
                </Box>
            </Tabs.Panel>
            <Tabs.Panel value="creators" mih={200}>
                <Box px="md">
                    <Space h={16} hiddenFrom="smlg" />
                    <Spoiler
                        maxHeight={200}
                        showLabel="Show more"
                        hideLabel="Hide"
                    >
                        <SimpleGrid
                            cols={{ base: 1, "400px": 2 }}
                            spacing={{ base: "sm", sm: "lg" }}
                            type="container"
                        >
                            {Object.entries(
                                data.creators.reduce((acc, creator) => {
                                    if (!acc[creator.role]) {
                                        acc[creator.role] = [];
                                    }
                                    acc[creator.role].push(creator.name);
                                    return acc;
                                }, {} as Record<string, string[]>)
                            ).map(([role, names]) => (
                                <Box
                                    key={role}
                                    className={classes.creatorBox}
                                    px={8}
                                >
                                    <Text size="sm" c="dimmed">
                                        <strong>{role}</strong>
                                    </Text>
                                    <Text>{names.join(", ")}</Text>
                                </Box>
                            ))}
                        </SimpleGrid>
                    </Spoiler>
                </Box>
            </Tabs.Panel>
            <Tabs.Panel value="external_links" mih={200}>
                <Box px="md">
                    <Space h={16} hiddenFrom="smlg" />
                    <Spoiler
                        maxHeight={200}
                        showLabel="Show more"
                        hideLabel="Hide"
                    >
                        <SimpleGrid
                            cols={{ base: 1, sm: 2, md: 3 }}
                            spacing={{ base: "sm", sm: "lg" }}
                            verticalSpacing={{ base: "sm", sm: "lg" }}
                        >
                            {data.external_links
                                .filter(
                                    (link) =>
                                        ![
                                            "funimation",
                                            "thetvdb",
                                            "tmdb",
                                        ].includes(link.type)
                                )
                                .filter((link, index, array) => {
                                    const imdbLinksSoFar = array
                                        .slice(0, index + 1)
                                        .filter(
                                            (l) => l.type === "imdb"
                                        ).length;

                                    return (
                                        link.type !== "imdb" ||
                                        imdbLinksSoFar <= 1
                                    );
                                })
                                .map((link) => {
                                    const config =
                                        externalLinkMapping[link.type];
                                    return (
                                        <Group
                                            key={`${link.type}-${link.identifier}`}
                                            gap="xs"
                                        >
                                            <Image
                                                src={config.icon}
                                                alt={config.name}
                                                w={48}
                                                loading="lazy"
                                                h={16}
                                                fit="contain"
                                            />
                                            <Text
                                                component="a"
                                                href={config.url(
                                                    link.identifier
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                c="blue"
                                            >
                                                {config.name}
                                            </Text>
                                        </Group>
                                    );
                                })}
                        </SimpleGrid>
                    </Spoiler>
                </Box>
            </Tabs.Panel>
        </Tabs>
    );
}

export default AnimeSeasonDetails;
