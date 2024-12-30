import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { Image } from "@mantine/core";
import classes from "./PosterImage.module.css";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

function PosterImage() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();
    const { animeseason } = usePage<PageProps>().props;

    if (type === "animeseason" && animeseason) {
        return (
            <div className={classes.posterWrapper}>
                <Image
                    src={`https://anidb.net/images/main/${animeseason.picture}`}
                    alt={animeseason.title_main}
                    fit="cover"
                    height={186}
                    fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                    className={classes.poster}
                    loading="lazy"
                />
            </div>
        );
    }

    // Handle anime content
    if (type === "animetv" || type === "animemovie") {
        if (!animeContent) return null;
        const { tmdbData } = animeContent;

        return (
            <div className={classes.posterWrapper}>
                <Image
                    src={`https://image.tmdb.org/t/p/original${tmdbData.poster_path}`}
                    alt={tmdbData.title}
                    fit="cover"
                    fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                    className={classes.poster}
                    loading="lazy"
                />
            </div>
        );
    }

    // Handle regular content
    if (!regularContent) return null;

    return (
        <div className={classes.posterWrapper}>
            <Image
                src={`https://image.tmdb.org/t/p/original${regularContent.poster_path}`}
                alt={regularContent.title}
                fit="cover"
                fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                className={classes.poster}
                loading="lazy"
            />
        </div>
    );
}

export default PosterImage;
