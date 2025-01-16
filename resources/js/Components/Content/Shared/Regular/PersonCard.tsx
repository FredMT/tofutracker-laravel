import {AnimePerson, TmdbPerson} from "@/types";
import {Card, Image, Stack, Text, Tooltip} from "@mantine/core";

interface PersonCardProps {
    person: TmdbPerson | AnimePerson;
    type: "cast" | "crew";
    isAnime: boolean;
}

function PersonCard({ person, type, isAnime }: PersonCardProps) {
    const getImageUrl = () => {
        if (isAnime) {
            return person.picture;
        }
        return `https://image.tmdb.org/t/p/w600_and_h900_bestv2${
            (person as TmdbPerson).profile_path
        }`;
    };

    const getSubtext = () => {
        if (isAnime) {
            return type === "cast"
                ? (person as AnimePerson).seiyuu
                : (person as AnimePerson).characters;
        }
        return type === "cast"
            ? (person as TmdbPerson).character
            : (person as TmdbPerson).job;
    };

    return (
        <Card
            radius="md"
            w={140}
            withBorder={false}
            style={{ background: "rgba(0, 0, 0, 0)" }}
            shadow="none"
        >
            <Card.Section>
                <Image
                    src={getImageUrl()}
                    height={186}
                    h={186}
                    w={124}
                    style={{ objectPosition: "top" }}
                    alt={person.name}
                    fit="cover"
                    radius="md"
                    loading="lazy"
                    fallbackSrc={`data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="140" height="211">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" text-anchor="middle">${person.name}</text>
        </svg>`)}`}
                />
            </Card.Section>

            <Card.Section>
                <Stack gap={8} mt={12}>
                    <Tooltip label={person.name} openDelay={150}>
                        <Text fw={600} size="sm" lineClamp={1}>
                            {person.name}
                        </Text>
                    </Tooltip>
                    <Tooltip label={getSubtext()} openDelay={150}>
                        <Text size="sm" lineClamp={1}>
                            {getSubtext()}
                        </Text>
                    </Tooltip>
                </Stack>
            </Card.Section>
        </Card>
    );
}

export default PersonCard;
