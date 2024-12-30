import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { BannerImage } from "@/Components/Content/Shared/Regular/BannerImage";
import { usePage } from "@inertiajs/react";
import { PageProps } from "@/types";

export function BannerImageContainer() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();
    const { animeseason } = usePage<PageProps>().props;

    if (type === "animeseason" && animeseason) {
        return (
            <BannerImage
                title={animeseason.title_main}
                backdrop_path={animeseason.backdrop_path}
                logo_path={animeseason.logo_path}
                genres={[]} // Add genres if available in animeseason
                height={540}
            />
        );
    }

    if (type === "animetv" || type === "animemovie") {
        // Handle anime content
        if (!animeContent) return null;
        const { tmdbData } = animeContent;

        return (
            <BannerImage
                title={tmdbData.title}
                backdrop_path={tmdbData.backdrop_path}
                logo_path={tmdbData.logo_path}
                genres={tmdbData.genres}
                height={540}
            />
        );
    }

    // Handle regular content
    if (!regularContent) return null;

    return (
        <BannerImage
            title={regularContent.title}
            backdrop_path={regularContent.backdrop_path}
            logo_path={regularContent.logo_path}
            genres={regularContent.genres}
            height={540}
        />
    );
}
