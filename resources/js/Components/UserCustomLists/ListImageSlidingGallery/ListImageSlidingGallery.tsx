import React, {useState} from "react";
import styles from "./ListImageSlidingGallery.module.css";
import {Image} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {Poster} from "@/types/userCustomLists";
import {Link} from "@inertiajs/react";

interface ListImageSlidingGallery {
    images: Poster[] | null;
    listId: number;
}

const PlaceholderImage = ({
    height,
    width,
}: {
    height: number;
    width: number;
}) => (
    <div className={styles.placeholder} style={{ height, width }}>
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 124 186"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
        >
            <rect width="100%" height="100%" />
        </svg>
    </div>
);

const getImageUrl = (poster: Poster | null): string | null => {
    if (!poster) return null;

    const { poster_path, poster_type } = poster;
    if (poster_type === "tmdb") {
        return `https://image.tmdb.org/t/p/w500${poster_path}`;
    }
    if (poster_type === "anidb") {
        return `https://anidb.net/images/main/${poster_path}`;
    }
    return poster_path;
};

const ListImageSlidingGallery: React.FC<ListImageSlidingGallery> = ({
    images,
    listId,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const isSmallScreen = useMediaQuery("(max-width: 400px)");
    const isMediumScreen = useMediaQuery(
        "(min-width: 500px) and (max-width: 1000px)"
    );

    const leftStyle = isMediumScreen ? 30 : isSmallScreen ? 45 : 60;
    const imageHeight = isMediumScreen ? 108 : isSmallScreen ? 150 : 186;
    const imageWidth = isMediumScreen ? 70 : isSmallScreen ? 100 : 124;

    const displayImages = Array(5)
        .fill(null)
        .map((_, index) => ({
            src: getImageUrl(images?.[index] ?? null),
            alt: `List item ${index + 1}`,
        }));

    return (
        <Link href={route("list.show", listId)}>
            <div className={styles.container}>
                {displayImages.map((image, index) => (
                    <div
                        key={`image-${index}`}
                        className={styles.imageWrapper}
                        style={{
                            left: `${index * leftStyle}px`,
                            transform:
                                hoveredIndex !== null
                                    ? index < hoveredIndex
                                        ? `translateX(-${leftStyle}px)`
                                        : "translateX(0)"
                                    : "translateX(0)",
                            zIndex: 5 - index,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {image.src ? (
                            <Image
                                src={image.src}
                                alt={image.alt}
                                height={imageHeight}
                                h={imageHeight}
                                w={imageWidth}
                                radius="md"
                                fit="cover"
                                className={styles.image}
                            />
                        ) : (
                            <PlaceholderImage
                                height={imageHeight}
                                width={imageWidth}
                            />
                        )}
                    </div>
                ))}
            </div>
        </Link>
    );
};

export default ListImageSlidingGallery;
