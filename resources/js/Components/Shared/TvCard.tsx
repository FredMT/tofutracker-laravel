import { UserTvShow } from "@/types/userTv";
import { Link } from "@inertiajs/react";
import {
    Badge,
    Card,
    Group,
    Image,
    Modal,
    Space,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronUp } from "lucide-react";
import { useState } from "react";
import classes from "./TvCard.module.css";

interface TvCardProps {
    show: UserTvShow;
}

export function TvCard({ show }: TvCardProps) {
    const [showSeasons, setShowSeasons] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 40em)");

    const sortedSeasons = show.seasons.sort(
        (a, b) => a.season_number - b.season_number
    );

    return (
        <>
            <Card maw={180} bg="transparent" bd={0} shadow="none">
                <Card.Section pos="relative">
                    <Link href={route("tv.show", { id: show.id })} prefetch>
                        <Tooltip label={show.title} openDelay={150}>
                            <Image
                                src={
                                    show.poster_path
                                        ? `https://image.tmdb.org/t/p/w185${show.poster_path}`
                                        : undefined
                                }
                                alt={`${show.title} Poster`}
                                height={210}
                                className={classes.posterImage}
                                radius="md"
                                fallbackSrc={`https://placehold.co/172x260?text=${
                                    show.title ?? ""
                                }`}
                            />
                        </Tooltip>
                    </Link>
                    {show.rating && (
                        <Badge
                            bg="violet.8"
                            size="xs"
                            className={classes.ratingBadge}
                        >
                            {show.rating}
                        </Badge>
                    )}
                </Card.Section>
                <Card.Section>
                    <Title order={4} lineClamp={2} fw={500}>
                        {show.title}
                    </Title>
                </Card.Section>
                <Card.Section>
                    <Badge
                        bg="violet.9"
                        py={12}
                        radius="sm"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowSeasons(true)}
                    >
                        <Group justify="space-between" w="100%" wrap="nowrap">
                            <Space w={0} />
                            <Text size="xs">
                                {show.user_total_seasons}/{show.total_seasons}{" "}
                                Seasons
                            </Text>
                            <ChevronUp
                                size={14}
                                className={`${classes.chevron} ${
                                    showSeasons
                                        ? classes.chevronUp
                                        : classes.chevronDown
                                }`}
                            />
                        </Group>
                    </Badge>
                </Card.Section>
            </Card>

            <Modal
                opened={showSeasons}
                onClose={() => setShowSeasons(false)}
                title={`${show.title} Seasons`}
                size="xl"
                centered
            >
                {isDesktop ? (
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
                                                seasonNumber:
                                                    season.season_number,
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
                                                seasonNumber:
                                                    season.season_number,
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
                ) : (
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
                                                    seasonNumber:
                                                        season.season_number,
                                                })}
                                                prefetch
                                            >
                                                <Title order={5} lineClamp={1}>
                                                    {season.title}
                                                </Title>
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
                )}
            </Modal>
        </>
    );
}

export default TvCard;
