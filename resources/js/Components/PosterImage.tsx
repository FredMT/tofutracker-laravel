// import { useContent } from "@/hooks/useContent";
// import { Image } from "@mantine/core";
// import classes from "./PosterImage.module.css";

// function PosterImage() {
//     const { content } = useContent();
//     if (!content) return null;
//     return (
//         <div className={classes.posterWrapper}>
//             <Image
//                 src={`https://image.tmdb.org/t/p/original${content.poster_path}`}
//                 alt={content.title}
//                 fit="cover"
//                 fallbackSrc="https://placehold.co/600x900?text=No+Poster"
//                 className={classes.poster}
//             />
//         </div>
//     );
// }

// export default PosterImage;

import { useContent } from "@/hooks/useContent";
import { useAnimeContent } from "@/hooks/useAnimeContent";
import { Image } from "@mantine/core";
import classes from "./PosterImage.module.css";

function PosterImage() {
    const { content: regularContent, type } = useContent();
    const animeContent = useAnimeContent();

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
            />
        </div>
    );
}

export default PosterImage;
