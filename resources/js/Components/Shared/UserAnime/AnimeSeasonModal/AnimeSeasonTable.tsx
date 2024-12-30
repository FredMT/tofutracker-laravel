import { AnimeEntry } from "@/types/userAnime";
import { Link } from "@inertiajs/react";
import { Badge, Image, Table, Text, Title } from "@mantine/core";

interface AnimeSeasonTableProps {
    entries: AnimeEntry[];
    chainName?: string;
    collectionId?: number;
    isMovie?: boolean;
}

export default function AnimeSeasonTable({
    entries,
    chainName,
    collectionId,
    isMovie = false,
}: AnimeSeasonTableProps) {
    return (
        <div>
            {chainName && (
                <Title order={4} mb="sm">
                    {chainName}
                </Title>
            )}
            <Table withTableBorder highlightOnHover>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w={100}>Poster</Table.Th>
                        <Table.Th miw={120}>Title</Table.Th>
                        {!isMovie && <Table.Th maw={100}>Episodes</Table.Th>}
                        <Table.Th maw={70}>Rating</Table.Th>
                        <Table.Th w={150}>Added</Table.Th>
                        <Table.Th miw={130}>Status</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {entries.map((entry) => (
                        <Table.Tr key={entry.id}>
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
                                    <Image
                                        src={
                                            entry.poster_path
                                                ? `https://anidb.net/images/main/${entry.poster_path}`
                                                : undefined
                                        }
                                        height={100}
                                        width={67}
                                        radius="sm"
                                        loading="lazy"
                                        alt={entry.title}
                                        fallbackSrc={`https://placehold.co/92x138?text=${entry.title}`}
                                    />
                                </Link>
                            </Table.Td>
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
                                    <Text fw={500}>{entry.title}</Text>
                                </Link>
                            </Table.Td>
                            {!isMovie && (
                                <Table.Td>
                                    <Badge color="violet" radius="md">
                                        {entry.watched_episodes}/
                                        {entry.total_episodes}
                                    </Badge>
                                </Table.Td>
                            )}
                            <Table.Td>
                                {entry.rating && (
                                    <Badge bg="violet.8" size="lg">
                                        {entry.rating}
                                    </Badge>
                                )}
                            </Table.Td>
                            <Table.Td>{entry.added_at}</Table.Td>
                            <Table.Td>
                                <Badge color="violet" radius="md">
                                    {entry.watch_status}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </div>
    );
}
