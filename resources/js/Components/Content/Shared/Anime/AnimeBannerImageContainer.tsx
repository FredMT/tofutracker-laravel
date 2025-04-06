import { BannerImage } from "@/Components/Content/Shared/Regular/BannerImage";
import { usePage } from "@inertiajs/react";
import { AnimeSeason } from "@/types/animeseason";
import { Anime } from "@/types/anime";
import { AnimeType } from "@/types";
import { useAnimeContentData } from "@/propsHooks/useAnimeContentData";

export function AnimeBannerImageContainer() {
	const { type } = usePage<{
		type: AnimeType;
	}>().props;

	let data = useAnimeContentData();

	if (type === "animeseason") {
		data = data as AnimeSeason;
		return (
			<BannerImage
				title={data.title_main}
				backdrop_path={data.backdrop_path}
				logo_path={data.logo_path}
				genres={[]}
				height={540}
			/>
		);
	}

	if (type === "animetv" || type === "animemovie") {
		data = data as Anime;
		return (
			<BannerImage
				title={data.tmdbData.data.title}
				backdrop_path={data.tmdbData.data.backdrop_path}
				logo_path={data.tmdbData.data.logo_path}
				genres={data.tmdbData.data.genres}
				height={540}
			/>
		);
	}

	return null;
}
