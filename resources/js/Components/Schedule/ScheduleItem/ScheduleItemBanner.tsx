import { svgDataUri } from "@/constants/svgDataUri";
import styles from "./Schedule.module.css";
import { ScheduleItem } from "@/types/schedule";
import { Box, Image, Overlay, Tooltip } from "@mantine/core";
import { Link } from "@inertiajs/react";

function ScheduleItemBanner({ item }: { item: ScheduleItem }) {
    const content = (
        <Tooltip label={item.title} position="bottom" withArrow>
            <Box w="100%" h={133} pos="relative">
                <Image
                    src={
                        item.backdrop
                            ? `https://image.tmdb.org/t/p/w300${item.backdrop}`
                            : null
                    }
                    alt={item.title}
                    fallbackSrc={svgDataUri}
                    loading="lazy"
                    maw={238}
                    mah={133}
                    className={styles.scheduleBackdropImage}
                />
                {item.logo && (
                    <>
                        <Overlay
                            gradient="linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.85) 100%)"
                            opacity={0.85}
                            zIndex={1}
                        />
                        <Box
                            pos="absolute"
                            bottom={8}
                            left="50%"
                            style={{
                                transform: "translateX(-50%)",
                                zIndex: 2,
                            }}
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w154${item.logo}`}
                                alt={`${item.title} Logo`}
                                h={75}
                                mah={75}
                                fit="contain"
                                loading="lazy"
                            />
                        </Box>
                    </>
                )}
            </Box>
        </Tooltip>
    );

    return item.link ? <Link href={item.link}>{content}</Link> : content;
}

export default ScheduleItemBanner;
