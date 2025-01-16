import {Badge, Group, Image, Space, Stack, Text} from "@mantine/core";

interface SearchResultItemProps {
    id: number;
    title: string;
    media_type: string;
    year: string;
    poster_path: string | null;
    genres: string[];
}

export default function SearchResultItem({
    id,
    title,
    media_type,
    year,
    poster_path,
    genres,
}: SearchResultItemProps) {
    return (
        <Group wrap="nowrap" h={110} gap="sm">
            <Image
                src={
                    poster_path
                        ? `https://image.tmdb.org/t/p/w92${poster_path}`
                        : null
                }
                h={110}
                w={73}
                radius="sm"
                loading="lazy"
                alt={title}
                fallbackSrc="https://placehold.co/73x110"
            />
            <Stack gap={0} style={{ flex: 1 }}>
                <Group gap="xs">
                    <Text size="sm" fw={500} lineClamp={1} style={{ flex: 1 }}>
                        {title}
                    </Text>
                </Group>
                <Space h={1} />
                <Group gap={4}>
                    <Text size="xs" c="dimmed">
                        {media_type.toUpperCase()}
                    </Text>
                    {year && (
                        <Text size="xs" c="dimmed">
                            • {year}
                        </Text>
                    )}
                </Group>
                <Space h={10} />
                <Group gap={2} wrap="wrap">
                    {genres.map((genre) => (
                        <Badge
                            key={genre}
                            size="sm"
                            variant="light"
                            radius="sm"
                        >
                            {genre}
                        </Badge>
                    ))}
                </Group>
            </Stack>
        </Group>
    );
}
