import {Carousel} from "@mantine/carousel";
import {Container, ContainerProps, Space, Stack, Title,} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {ReactNode} from "react";
import classes from "./WelcomeCustomCarousel.module.css";

interface WelcomeCustomCarouselProps {
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

export function WelcomeCustomCarousel({
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
    titleOrder = 2,
}: WelcomeCustomCarouselProps) {
    const isMobile = useMediaQuery("(max-width: 500px)");

    // If on mobile, only scroll 1 slide at a time
    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

    return (
        <Stack gap="xs">
            {isMobile && title ? (
                <Stack gap={0}>
                    <Title order={titleOrder}>{title}</Title>
                    <Title order={titleOrder}>{" Content"}</Title>
                </Stack>
            ) : (
                <Title order={titleOrder}>{title + " Content"}</Title>
            )}
            <Space h="xs" />
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

export default WelcomeCustomCarousel;
