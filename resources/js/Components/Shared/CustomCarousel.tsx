import { Carousel } from "@mantine/carousel";
import { Container, ContainerProps } from "@mantine/core";
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
}

export function CustomCarousel({
    children,
    containerWidth = "100%",
    slideSize = "300px",
    height = 300,
    slidesToScroll = 3,
    withControls = true,
    align = "start",
    className,
}: CustomCarouselProps) {
    const isMobile = useMediaQuery("(max-width: 640px)");

    // If on mobile, only scroll 1 slide at a time
    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

    return (
        <Container size={containerWidth} className="select-none" px={0} mx={0}>
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
            >
                {children}
            </Carousel>
        </Container>
    );
}

export default CustomCarousel;
