import {Badge, Box, Card, Image, Text, Tooltip} from "@mantine/core";
import {Link} from "@inertiajs/react";
import {ListItem} from "@/types/listPage";

interface ListItemCardProps {
    item: ListItem;
    isEditing?: boolean;
}

export function ListItemCard({ item, isEditing = false }: ListItemCardProps) {
    const imageUrl =
        item.poster_type === "tmdb"
            ? `https://image.tmdb.org/t/p/w600_and_h900_bestv2${item.poster_path}`
            : `https://anidb.net/images/main/${item.poster_path}`;

    const content = (
        <CardContent
            imageUrl={imageUrl}
            title={item.title}
            year={item.year}
            voteAverage={item.vote_average}
        />
    );

    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            {item.link && !isEditing ? (
                <Link href={item.link} prefetch>
                    {content}
                </Link>
            ) : (
                content
            )}
        </Card>
    );
}

interface CardContentProps {
    imageUrl: string;
    title: string;
    year: number;
    voteAverage: number;
}

function CardContent({ imageUrl, title, year, voteAverage }: CardContentProps) {
    return (
        <>
            <Card.Section pos="relative">
                {!!voteAverage && (
                    <Badge
                        size="lg"
                        radius="md"
                        variant="filled"
                        style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            zIndex: 1,
                        }}
                    >
                        {voteAverage}
                    </Badge>
                )}
                <Image
                    src={imageUrl}
                    radius="md"
                    height={186}
                    h={186}
                    w={124}
                    fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
                        <rect width="100%" height="100%" fill="#f0f0f0"/>
                        <text x="50%" y="50%" text-anchor="middle">${title}</text>
                    </svg>`)}`}
                    loading="lazy"
                />
            </Card.Section>
            <Card.Section mt="xs">
                <Tooltip label={`${title} (${year})`} openDelay={150}>
                    <Box>
                        <Text fw={600} size="sm" lineClamp={2}>
                            {title}
                        </Text>
                        <Text fw={600} size="sm" mt={6} c="dimmed">
                            {year}
                        </Text>
                    </Box>
                </Tooltip>
            </Card.Section>
        </>
    );
}
