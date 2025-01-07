import { BannerImageOverlay } from "@/Components/Content/Shared/BannerImageOverlay";
import { Genre } from "@/types";
import { Flex, Image } from "@mantine/core";

interface BannerImageProps {
    title: string;
    backdrop_path?: string;
    logo_path: string;
    genres?: Genre[];
    height: number;
}

export function BannerImage({
    title,
    backdrop_path,
    logo_path,
    genres,
    height,
}: BannerImageProps) {
    return (
        <Flex direction="column" pos="relative">
            <Image
                src={
                    backdrop_path
                        ? `https://image.tmdb.org/t/p/original${backdrop_path}`
                        : undefined
                }
                alt={title}
                fit="cover"
                h={height}
                mah={height}
                mih={height}
                height={height}
                fallbackSrc={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='540' viewBox='0 0 1920 540'><rect width='1920' height='540' fill='%23cccccc'/><text x='50%25' y='50%25' font-size='48' font-family='Arial,sans-serif' fill='%23000000' text-anchor='middle' alignment-baseline='central'>${title}</text></svg>`}
            />
            <BannerImageOverlay
                logo_path={logo_path}
                title={title}
                genres={genres}
            />
        </Flex>
    );
}
