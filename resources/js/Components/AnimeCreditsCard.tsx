import { CastMember, SeiyuuMember } from "@/types/anime";
import { Card, Group, Image, Stack, Text, Tooltip } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import classes from "./AnimeCreditsCard.module.css";

interface AnimeCreditsCardProps {
    character: CastMember;
    seiyuus: SeiyuuMember[];
}

function AnimeCreditsCard({ character, seiyuus }: AnimeCreditsCardProps) {
    return (
        <Card
            radius="md"
            withBorder
            w={300}
            mr={20}
            mt={10}
            mih={264}
            shadow="none"
        >
            <Group wrap="nowrap" gap="md" justify="center">
                <Stack gap={8} mih={200}>
                    <Image
                        src={character.picture}
                        h={186}
                        mih={186}
                        mah={186}
                        maw={124}
                        radius={"md"}
                        w={124}
                        alt={character.name}
                        fit="cover"
                        style={{ objectPosition: "top" }}
                        fallbackSrc={`https://placehold.co/124x186?text=${character.name}`}
                    />
                    <Tooltip label={character.name} openDelay={150}>
                        <Text size="sm" fw={500} lineClamp={1} w={124}>
                            {character.name}
                        </Text>
                    </Tooltip>
                </Stack>

                <Stack gap={8} mih={200}>
                    {seiyuus.length > 1 ? (
                        <Carousel
                            h={186}
                            mah={186}
                            mih={186}
                            miw={124}
                            maw={124}
                            w={124}
                            withControls={true}
                            withIndicators={false}
                            align="start"
                            classNames={{
                                control: classes.carouselControl,
                                controls: classes.carouselControls,
                            }}
                        >
                            {seiyuus.map((seiyuu) => (
                                <Carousel.Slide key={seiyuu.id}>
                                    <Image
                                        src={seiyuu.picture}
                                        h={186}
                                        mah={186}
                                        maw={124}
                                        mih={186}
                                        radius={"md"}
                                        miw={124}
                                        w={124}
                                        alt={seiyuu.name}
                                        fit="cover"
                                        style={{ objectPosition: "top" }}
                                        fallbackSrc={`https://placehold.co/124x186?text=${seiyuu.name}`}
                                    />
                                </Carousel.Slide>
                            ))}
                        </Carousel>
                    ) : (
                        <Image
                            src={seiyuus[0]?.picture}
                            h={186}
                            mah={186}
                            maw={124}
                            mih={186}
                            miw={124}
                            w={124}
                            radius={"md"}
                            alt={seiyuus[0]?.name}
                            fit="cover"
                            style={{ objectPosition: "top" }}
                            fallbackSrc={`https://placehold.co/124x186?text=${
                                seiyuus[0]?.name || `${character.name}'s seiyuu`
                            }`}
                        />
                    )}
                    <Tooltip
                        label={
                            seiyuus.length
                                ? seiyuus.map((s) => s.name).join(", ")
                                : `${character.name}'s seiyuu`
                        }
                        openDelay={150}
                    >
                        <Text size="sm" fw={500} lineClamp={1} w={124} truncate>
                            {seiyuus.length
                                ? seiyuus.map((s) => s.name).join(", ")
                                : `${character.name}'s seiyuu`}
                        </Text>
                    </Tooltip>
                </Stack>
            </Group>
        </Card>
    );
}

export default AnimeCreditsCard;
