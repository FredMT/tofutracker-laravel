import { useContent } from "@/hooks/useContent";
import { Image } from "@mantine/core";
import classes from "./PosterImage.module.css";

function PosterImage() {
    const { content } = useContent();
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
