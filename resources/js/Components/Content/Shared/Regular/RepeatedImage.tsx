import { Image } from "@mantine/core";
import styles from "./RepeatedImage.module.css";

function RepeatedImage({
    backdrop_path,
    title,
    height,
}: {
    backdrop_path?: string;
    title: string;
    height: number;
}) {
    const imageSrc = backdrop_path
        ? `https://image.tmdb.org/t/p/original${backdrop_path}`
        : undefined;

    const fallbackSrc = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${title}</text></svg>`;

    return (
        <div className={styles.container}>
            <Image
                src={imageSrc}
                alt={`${title} - top section 1`}
                className={styles.repeatedTop}
                fallbackSrc={fallbackSrc}
            />

            <Image
                src={imageSrc}
                alt={`${title} - top section 2`}
                className={styles.repeatedTop}
                fallbackSrc={fallbackSrc}
            />

            <Image
                src={imageSrc}
                alt={title}
                className={styles.mainImage}
                fit="cover"
                h={height}
                mah={height}
                mih={height}
                height={height}
                fallbackSrc={fallbackSrc}
            />
        </div>
    );
}

export default RepeatedImage;
