import { Carousel } from "@mantine/carousel";
import { Container, ContainerProps, Title, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ReactNode } from "react";
import classes from "./CustomCarousel.module.css";

interface CustomCarouselProps {
    children: ReactNode;
    containerWidth?: ContainerProps["size"];
    slideSize?: string;
    height?: number;
    slidesToScroll?: number;
    withControls?: boolean;
    align?: "start" | "center" | "end";
    className?: string;
    slideGap?: number;
    title?: string;
    titleOrder?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function CustomCarousel({
    children,
    containerWidth = "100%",
    slideSize = "300px",
    height = 300,
    slidesToScroll = 3,
    withControls = true,
    align = "start",
    slideGap = 0,
    className,
    title,
    titleOrder = 3,
}: CustomCarouselProps) {
    const isMobile = useMediaQuery("(max-width: 640px)");

    // If on mobile, only scroll 1 slide at a time
    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

    return (
        <Stack gap="xs">
            {title && <Title order={titleOrder}>{title}</Title>}
            <Container
                size={containerWidth}
                className="select-none"
                px={0}
                mx={0}
            >
                <Carousel
                    height={height}
                    slideSize={slideSize}
                    align={align}
                    slidesToScroll={mobileSlidesToScroll}
                    withControls={withControls}
                    classNames={{
                        control: classes.carouselControl,
                        controls: classes.carouselControls,
                    }}
                    className={className}
                    slideGap={slideGap}
                >
                    {children}
                </Carousel>
            </Container>
        </Stack>
    );
}

export default CustomCarousel;
