import { Genre } from "@/types";
import { Badge, Flex, Group, Image, Paper } from "@mantine/core";
import classes from "./BannerImage.module.css";

interface BannerImageProps {
    logo_path: string;
    title: string;
    genres?: Genre[];
}

export function BannerImageOverlay({
    logo_path,
    title,
    genres,
}: BannerImageProps) {
    return (
        <Flex
            pos="absolute"
            bottom={0}
            w="100%"
            justify="center"
            align="center"
            pb="xl"
            direction={{ base: "column" }}
        >
            <Paper
                className={classes.logoWrapper}
                withBorder={false}
                shadow="none"
            >
                {logo_path && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${logo_path}`}
                        alt={title}
                        fit="contain"
                        w={400}
                        className={classes.logo}
                    />
                )}
            </Paper>
            {genres && (
                <Group gap={2} justify="center">
                    {genres.map((genre: Genre) => (
                        <Badge key={genre.id} variant="filled" color="black">
                            {genre.name}
                        </Badge>
                    ))}
                </Group>
            )}
        </Flex>
    );
}
