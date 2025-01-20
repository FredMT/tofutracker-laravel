import {Carousel} from "@mantine/carousel";
import {Container, ContainerProps, Group, Image, Menu, Space, Stack, Title,} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import {ReactNode} from "react";
import classes from "./WelcomeCustomCarousel.module.css";
import {ChevronDown} from "lucide-react";

interface WelcomeProviderCarouselProps {
    children: ReactNode;
    containerWidth?: ContainerProps["size"];
    slideSize?: string;
    height?: number;
    slidesToScroll?: number;
    withControls?: boolean;
    align?: "start" | "center" | "end";
    className?: string;
    slideGap?: number;
    providerId: string;
    onProviderChange?: (providerId: string) => void;
}

const getProviderLogo = (providerId: string): string => {
    switch (providerId) {
        case "8":
            return "/icons/welcome/netflix.png";
        case "1899":
            return "/icons/welcome/hbomax.png";
        case "9":
            return "/icons/welcome/primevideo.png";
        case "283":
            return "/icons/welcome/crunchyroll.svg";
        case "337":
            return "/icons/welcome/disney.png";
        case "350":
            return "/icons/welcome/appletv.png";
        case "531":
            return "/icons/welcome/paramount.png";
        default:
            return "";
    }
};

export function WelcomeProviderCarousel({
    children,
    containerWidth = "100%",
    slideSize = "300px",
    height = 300,
    slidesToScroll = 3,
    withControls = true,
    align = "start",
    slideGap = 0,
    className,
    providerId,
    onProviderChange,
}: WelcomeProviderCarouselProps) {
    const isMobile = useMediaQuery("(max-width: 500px)");
    const mobileSlidesToScroll = isMobile ? 1 : slidesToScroll;

    return (
        <Stack gap="xs">
            <Group gap={12}>
                <Title order={3}>Discover Content From</Title>
                <Menu shadow="md">
                    <Menu.Target>
                        <Group gap="xs" style={{ cursor: "pointer" }}>
                            <Image
                                src={getProviderLogo(providerId)}
                                h={50}
                                w="auto"
                                loading="lazy"
                                fit="contain"
                                style={{ cursor: "pointer" }}
                            />
                            <ChevronDown size={24} />
                        </Group>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item onClick={() => onProviderChange?.("8")}>
                            Netflix
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("1899")}>
                            HBO Max
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("9")}>
                            Prime Video
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("283")}>
                            Crunchyroll
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("337")}>
                            Disney+
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("350")}>
                            Apple TV+
                        </Menu.Item>
                        <Menu.Item onClick={() => onProviderChange?.("531")}>
                            Paramount+
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
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
