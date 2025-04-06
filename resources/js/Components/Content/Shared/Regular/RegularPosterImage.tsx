import { Image } from "@mantine/core";
import classes from "../styles/PosterImage.module.css";
import { useRegularContentData } from "@/propsHooks/useRegularContentData";

export default function RegularPosterImage() {
	const data = useRegularContentData();

	return (
		<div className={classes.posterWrapper}>
			<Image
				src={`https://image.tmdb.org/t/p/original${data.poster_path}`}
				alt={data.title}
				fit="cover"
				fallbackSrc="https://placehold.co/600x900?text=No+Poster"
				className={classes.poster}
				loading="lazy"
			/>
		</div>
	);
}
