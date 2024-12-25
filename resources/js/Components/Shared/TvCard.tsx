import { UserTvShow } from "@/types/userTv";
import { Link } from "@inertiajs/react";
import {
    Badge,
    Card,
    Group,
    Image,
    Space,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import { Calendar } from "lucide-react";
import classes from "./TvCard.module.css";

interface TvCardProps {
    show: UserTvShow;
}

export function TvCard({ show }: TvCardProps) {
    return (
        <Card maw={180} bg="transparent" bd={0} shadow="none">
            <Card.Section pos="relative">
                <Link href={route("tv.show", { id: show.id })} prefetch>
                    <Image
                        src={
                            show.poster_path
                                ? `https://image.tmdb.org/t/p/w780${show.poster_path}`
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
            <Space h={4} />
            <Card.Section>
                <Group gap={2} grow>
                    <Badge
                        bg="violet.8"
                        size="xs"
                        py={12}
                        px={10}
                        fz={10}
                        fw={400}
                        radius="sm"
                    >
                        {show.user_total_seasons}/{show.total_seasons} Seasons
                    </Badge>
                </Group>
            </Card.Section>
            <Space h={4} />
            <Card.Section>
                <Group gap={4}>
                    <Calendar size={13} color="gray" />
                    <Text c="dimmed" size="xs">
                        {show.added_at}
                    </Text>
                </Group>
            </Card.Section>
            <Space h={4} />
            <Card.Section>
                <Link href={route("tv.show", { id: show.id })} prefetch>
                    <Tooltip label={show.title} openDelay={150}>
                        <Title order={4} lineClamp={2}>
                            {show.title}
                        </Title>
                    </Tooltip>
                </Link>
            </Card.Section>
        </Card>
    );
}

export default TvCard;
