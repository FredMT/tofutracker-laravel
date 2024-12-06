import { Image } from "@mantine/core";
import classes from "./PosterImage.module.css";

interface Props {
    src: string;
    alt: string;
    fallbackSrc?: string;
}

function PosterImage({
    src,
    alt,
    fallbackSrc = "https://placehold.co/600x900?text=No+Poster",
}: Props) {
    return (
        <div className={classes.posterWrapper}>
            <Image
                src={src}
                alt={alt}
                fit="cover"
                fallbackSrc={fallbackSrc}
                className={classes.poster}
            />
        </div>
    );
}

export default PosterImage;
