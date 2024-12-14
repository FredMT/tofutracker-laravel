import { Image } from "@mantine/core";
import classes from "./PosterImage.module.css";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";

function PosterImage() {
    const { type, movie, tv, anime, tvseason } = usePage<PageProps>().props;
    const content =
        type === "movie"
            ? movie
            : type === "tv"
            ? tv
            : type === "tvseason"
            ? tvseason
            : anime;
    if (!content) return null;
    return (
        <div className={classes.posterWrapper}>
            <Image
                src={`https://image.tmdb.org/t/p/original${content.poster_path}`}
                alt={content.title}
                fit="cover"
                fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                className={classes.poster}
            />
        </div>
    );
}

export default PosterImage;
