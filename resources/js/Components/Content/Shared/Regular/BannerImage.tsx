import { BannerImageOverlay } from "@/Components/Content/Shared/BannerImageOverlay";
import { Genre } from "@/types";
import { Flex, Image } from "@mantine/core";
import RepeatedImage from "./RepeatedImage";

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
            <RepeatedImage
                backdrop_path={
                    backdrop_path
                        ? `https://image.tmdb.org/t/p/original${backdrop_path}`
                        : undefined
                }
                title={title}
                height={540}
            />
            <BannerImageOverlay
                logo_path={logo_path}
                title={title}
                genres={genres}
            />
        </Flex>
    );
}
