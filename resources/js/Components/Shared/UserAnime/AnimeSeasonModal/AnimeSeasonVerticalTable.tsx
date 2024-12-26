import { AnimeEntry } from "@/types/userAnime";
import { Link } from "@inertiajs/react";
import { Badge, Group, Stack, Table, Title } from "@mantine/core";
import { ExternalLink } from "lucide-react";

interface AnimeSeasonVerticalTableProps {
    entries: AnimeEntry[];
    chainName?: string;
    collectionId?: number;
    isMovie?: boolean;
}

export default function AnimeSeasonVerticalTable({
    entries,
    chainName,
    collectionId,
    isMovie = false,
}: AnimeSeasonVerticalTableProps) {
    return (
        <Stack gap="md">
            {chainName && (
                <Title order={4} mb="xs">
                    {chainName}
                </Title>
            )}
            {entries.map((entry) => (
                <Table
                    key={entry.id}
                    variant="vertical"
                    withTableBorder
                    highlightOnHover
                    layout="fixed"
                >
                    <Table.Tbody>
                        <Table.Tr>
                            <Table.Th w={120}>Title</Table.Th>
                            <Table.Td>
                                <Link
                                    href={route(
                                        collectionId
                                            ? "anime.season.show"
                                            : "anime.show",
                                        collectionId
                                            ? {
                                                  id: collectionId,
                                                  seasonId: entry.id,
                                              }
                                            : {
                                                  id: entry.id,
                                              }
                                    )}
                                >
                                    <Group>
                                        <Title order={5} lineClamp={1}>
                                            {entry.title}
                                        </Title>
                                        <ExternalLink size={16} />
                                    </Group>
                                </Link>
                            </Table.Td>
                        </Table.Tr>
                        {!isMovie && (
                            <Table.Tr>
                                <Table.Th>Episodes</Table.Th>
                                <Table.Td>
                                    <Badge color="violet" radius="md">
                                        {entry.watched_episodes}/
                                        {entry.total_episodes}
                                    </Badge>
                                </Table.Td>
                            </Table.Tr>
                        )}
                        <Table.Tr>
                            <Table.Th>Rating</Table.Th>
                            <Table.Td>
                                {entry.rating && (
                                    <Badge bg="violet.8" size="lg">
                                        {entry.rating}
                                    </Badge>
                                )}
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Added</Table.Th>
                            <Table.Td>{entry.added_at}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Status</Table.Th>
                            <Table.Td>
                                <Badge color="violet" radius="md">
                                    {entry.watch_status}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            ))}
        </Stack>
    );
}
