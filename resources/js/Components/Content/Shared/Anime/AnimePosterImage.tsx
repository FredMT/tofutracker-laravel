import { Image } from "@mantine/core";
import classes from "../styles/PosterImage.module.css";
import { AnimeSeason } from "@/types/animeseason";
import { Anime } from "@/types/anime";
import { useAnimeTypes } from "@/propsHooks/useAnimeTypes";
import { useAnimeContentData } from "@/propsHooks/useAnimeContentData";

export default function AnimePosterImage() {
	const type = useAnimeTypes();
	let data = useAnimeContentData();

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
