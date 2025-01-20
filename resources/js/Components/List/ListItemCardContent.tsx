import { Badge, Box, Card, Image, Text, Tooltip } from "@mantine/core";

interface ListItemCardContent {
    imageUrl: string;
    title: string;
    year: string;
    voteAverage: number;
}

export default function ListItemCardContent({
    imageUrl,
    title,
    year,
    voteAverage,
}: ListItemCardContent) {
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
                        <Text fw={600} size="sm" c="dimmed">
                            {year}
                        </Text>
                        <Text fw={600} size="sm" mt={6} lineClamp={2}>
                            {title}
                        </Text>
                    </Box>
                </Tooltip>
            </Card.Section>
        </>
    );
}
