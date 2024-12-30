import { UserTvShow } from "@/types/userTv";
import { Link } from "@inertiajs/react";
import { Badge, Image, Table, Title } from "@mantine/core";

interface TvSeasonTableProps {
    show: UserTvShow;
    sortedSeasons: UserTvShow["seasons"];
}

export function TvSeasonTable({ show, sortedSeasons }: TvSeasonTableProps) {
    return (
        <Table stickyHeader withTableBorder highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th w={100}>Poster</Table.Th>
                    <Table.Th miw={120}>Title</Table.Th>
                    <Table.Th maw={100}>Episodes</Table.Th>
                    <Table.Th maw={70}>Rating</Table.Th>
                    <Table.Th w={150}>Added</Table.Th>
                    <Table.Th miw={130}>Status</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {sortedSeasons.map((season) => (
                    <Table.Tr key={season.id}>
                        <Table.Td>
                            <Link
                                href={route("tv.season.show", {
                                    id: show.id,
                                    seasonNumber: season.season_number,
                                })}
                                prefetch
                            >
                                <Image
                                    src={
                                        season.poster_path
                                            ? `https://image.tmdb.org/t/p/w92${season.poster_path}`
                                            : undefined
                                    }
                                    height={100}
                                    width={67}
                                    loading="lazy"
                                    radius="sm"
                                    alt={season.title || ""}
                                    fallbackSrc={`https://placehold.co/92x138?text=${
                                        season.title || ""
                                    }`}
                                />
                            </Link>
                        </Table.Td>
                        <Table.Td>
                            <Link
                                href={route("tv.season.show", {
                                    id: show.id,
                                    seasonNumber: season.season_number,
                                })}
                                prefetch
                            >
                                <Title order={5} lineClamp={1}>
                                    {season.title}
                                </Title>
                            </Link>
                        </Table.Td>
                        <Table.Td>
                            <Badge color="violet" radius="md">
                                {season.watched_episodes}/
                                {season.total_episodes}
                            </Badge>
                        </Table.Td>
                        <Table.Td>
                            {season.rating && (
                                <Badge bg="violet.8" size="lg">
                                    {season.rating}
                                </Badge>
                            )}
                        </Table.Td>
                        <Table.Td>{season.added_at}</Table.Td>
                        <Table.Td>
                            <Badge color="violet" radius="md">
                                {season.watch_status}
                            </Badge>
                        </Table.Td>
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}

export default TvSeasonTable;
