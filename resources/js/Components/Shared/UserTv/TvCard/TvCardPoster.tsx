import { UserTvShow } from "@/types/userTv";
import { Link } from "@inertiajs/react";
import { Badge, Card, Image, Tooltip } from "@mantine/core";
import classes from "./TvCard.module.css";

interface TvCardPosterProps {
    show: UserTvShow;
}

export function TvCardPoster({ show }: TvCardPosterProps) {
    return (
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
                <Badge bg="violet.8" size="xs" className={classes.ratingBadge}>
                    {show.rating}
                </Badge>
            )}
        </Card.Section>
    );
}

export default TvCardPoster;
