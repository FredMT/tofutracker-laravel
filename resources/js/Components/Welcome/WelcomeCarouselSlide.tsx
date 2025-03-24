import { Link } from "@inertiajs/react";
import { Badge, Button, Flex, Image, Stack, Text, Title } from "@mantine/core";
import classes from "./WelcomeCarouselSlide.module.css";
import { useMediaQuery } from "@mantine/hooks";
import ResponsiveContainer from "@/Components/ResponsiveContainer";
import RepeatedImage from "../Content/Shared/Regular/RepeatedImage";

interface MediaItem {
    title: string;
    backdrop_path: string | null;
    logo_path: string | null;
    genres: string[];
    overview: string;
    release_date: string;
    link: string | number;
    type: string;
}

export default function WelcomeCarouselSlide({
    title,
    backdrop_path,
    logo_path,
    genres,
    overview,
    release_date,
    link,
    type,
}: MediaItem) {
    const allBadges = [...(genres || []), release_date];
    const mobile = useMediaQuery("(max-width: 400px)");

    return (
        <div className={classes.slideContainer}>
            <div>
                <RepeatedImage
                    backdrop_path={
                        backdrop_path
                            ? `https://image.tmdb.org/t/p/original${backdrop_path}`
                            : undefined
                    }
                    title={title}
                    height={540}
                />
            </div>
            <ResponsiveContainer>
                {logo_path ? (
                    <Link href={`/${type}/${link}`} prefetch>
                        <Image
                            src={`https://image.tmdb.org/t/p/w500${logo_path}`}
                            alt={title}
                            fit="contain"
                            loading="lazy"
                            height={120}
                            mih={120}
                            mah={120}
                            h={120}
                            maw={mobile ? 200 : 450}
                        />
                    </Link>
                ) : (
                    <Link href={`/${type}/${link}`} prefetch>
                        <Title>{title}</Title>
                    </Link>
                )}
                <Stack gap="xs" mt={8}>
                    <Flex gap={2} wrap="wrap" maw={500}>
                        {allBadges.map((item, index) => (
                            <Badge key={index} bg="black">
                                {item}
                            </Badge>
                        ))}
                    </Flex>
                    <Text c="white" lineClamp={2} maw={500} lh={1.5}>
                        {overview}
                    </Text>
                    <Button
                        variant="outline"
                        component={Link}
                        href={`/${type}/${link}`}
                        maw={140}
                        c="white"
                        size="md"
                        prefetch
                        radius="md"
                        style={{
                            borderColor: "white",
                        }}
                    >
                        See More
                    </Button>
                </Stack>
            </ResponsiveContainer>
        </div>
    );
}
