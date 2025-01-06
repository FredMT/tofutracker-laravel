import {Image} from "@mantine/core";
import classes from "../styles/PosterImage.module.css";
import {usePage} from "@inertiajs/react";
import {AnimeContentDataType, AnimeType,} from "@/types";
import {AnimeSeason} from "@/types/animeseason";
import {Anime} from "@/types/anime";

export default function AnimePosterImage() {
    const { type } = usePage<{ type: AnimeType }>().props;
    let { data } = usePage<{ data: AnimeContentDataType }>().props;

    if (type === "animeseason") {
        data = data as AnimeSeason;
        return (
            <div className={classes.posterWrapper}>
                <Image
                    src={`https://anidb.net/images/main/${data.picture}`}
                    alt={data.title_main}
                    fit="cover"
                    height={186}
                    fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                    className={classes.poster}
                    loading="lazy"
                />
            </div>
        );
    }

    if (type === "animetv" || type === "animemovie") {
        data = data as Anime;
        return (
            <div className={classes.posterWrapper}>
                <Image
                    src={`https://image.tmdb.org/t/p/original${data.tmdbData.data.poster_path}`}
                    alt={data.tmdbData.data.title}
                    fit="cover"
                    fallbackSrc="https://placehold.co/600x900?text=No+Poster"
                    className={classes.poster}
                    loading="lazy"
                />
            </div>
        );
    }
}
