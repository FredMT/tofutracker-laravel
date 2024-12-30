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
import classes from "./MovieCard.module.css";
import { Calendar } from "lucide-react";
import { Link } from "@inertiajs/react";

interface MovieCardProps {
    id: number;
    src: string;
    title: string;
    time: string | null;
    rating?: number | null;
    watch_status?: string | null;
}

export function MovieCard({
    id,
    src,
    title,
    time,
    rating,
    watch_status,
}: MovieCardProps) {
    return (
        <Card maw={180} bg="transparent" bd={0} shadow="none">
            <Card.Section pos="relative">
                <Link href={route("movie.show", { id })} prefetch>
                    <Image
                        src={src}
                        alt={`${title} Poster`}
                        height={210}
                        loading="lazy"
                        className={classes.posterImage}
                        radius="md"
                        fallbackSrc={`https://placehold.co/172x260?text=${
                            title ?? ""
                        }`}
                    />
                </Link>
                {rating && (
                    <Badge
                        bg="violet.8"
                        size="xs"
                        className={classes.ratingBadge}
                    >
                        {rating}
                    </Badge>
                )}
            </Card.Section>
            <Space h={4} />
            {watch_status && (
                <>
                    <Card.Section>
                        <Badge
                            bg="violet.8"
                            size="xs"
                            py={12}
                            px={10}
                            fz={10}
                            fw={400}
                            radius="sm"
                        >
                            {watch_status}
                        </Badge>
                    </Card.Section>
                    <Space h={4} />
                </>
            )}
            <Card.Section>
                <Group gap={4}>
                    <Calendar size={13} color="gray" />
                    <Text c="dimmed" size="xs">
                        {time}
                    </Text>
                </Group>
            </Card.Section>
            <Space h={4} />
            <Card.Section>
                <Link href={route("movie.show", { id })} prefetch>
                    <Tooltip label={title} openDelay={150}>
                        <Title order={4} lineClamp={2}>
                            {title}
                        </Title>
                    </Tooltip>
                </Link>
            </Card.Section>
        </Card>
    );
}

export default MovieCard;
