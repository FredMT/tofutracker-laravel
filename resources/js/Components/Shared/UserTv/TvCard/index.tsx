import {UserTvShow} from "@/types/userTv";
import {Card, Text, Tooltip} from "@mantine/core";
import {useState} from "react";
import TvSeasonModal from "../TvSeasonModal";
import TvCardPoster from "./TvCardPoster";
import TvCardSeasonsBadge from "./TvCardSeasonsBadge";
import {Link} from "@inertiajs/react";

interface TvCardProps {
    show: UserTvShow;
}

export function TvCard({ show }: TvCardProps) {
    const [showSeasons, setShowSeasons] = useState(false);

    return (
        <>
            <Card maw={180} bg="transparent" bd={0} shadow="none">
                <TvCardPoster show={show} />
                <Card.Section
                    component={Link}
                    href={route("tv.show", { id: show.id })}
                    prefetch
                >
                    <Tooltip label={show.title} openDelay={150}>
                        <Text lineClamp={1} fw={500}>
                            {show.title}
                        </Text>
                    </Tooltip>
                </Card.Section>
                <TvCardSeasonsBadge
                    show={show}
                    showSeasons={showSeasons}
                    onClick={() => setShowSeasons(true)}
                />
            </Card>

            <TvSeasonModal
                show={show}
                opened={showSeasons}
                onClose={() => setShowSeasons(false)}
            />
        </>
    );
}

export default TvCard;
