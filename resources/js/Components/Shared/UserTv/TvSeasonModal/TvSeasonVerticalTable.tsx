import {UserTvShow} from "@/types/userTv";
import {Link} from "@inertiajs/react";
import {Badge, Group, Stack, Table, Title} from "@mantine/core";
import {ExternalLink} from "lucide-react";

interface TvSeasonVerticalTableProps {
    show: UserTvShow;
    sortedSeasons: UserTvShow["seasons"];
}

export function TvSeasonVerticalTable({
    show,
    sortedSeasons,
}: TvSeasonVerticalTableProps) {
    return (
        <Stack gap="md">
            {sortedSeasons.map((season) => (
                <Table
                    key={season.id}
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
                                    href={route("tv.season.show", {
                                        id: show.id,
                                        seasonNumber: season.season_number,
                                    })}
                                    prefetch
                                >
                                    <Group>
                                        <Title order={5} lineClamp={1}>
                                            {season.title}
                                        </Title>
                                        <ExternalLink size={16} />
                                    </Group>
                                </Link>
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Episodes</Table.Th>
                            <Table.Td>
                                <Badge color="violet" radius="md">
                                    {season.watched_episodes}/
                                    {season.total_episodes}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Rating</Table.Th>
                            <Table.Td>
                                {season.rating && (
                                    <Badge bg="violet.8" size="lg">
                                        {season.rating}
                                    </Badge>
                                )}
                            </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Added</Table.Th>
                            <Table.Td>{season.added_at}</Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                            <Table.Th>Status</Table.Th>
                            <Table.Td>
                                <Badge color="violet" radius="md">
                                    {season.watch_status}
                                </Badge>
                            </Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            ))}
        </Stack>
    );
}

export default TvSeasonVerticalTable;
