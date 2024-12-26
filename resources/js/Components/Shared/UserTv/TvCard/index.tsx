import { UserTvShow } from "@/types/userTv";
import { Card, Title } from "@mantine/core";
import { useState } from "react";
import TvSeasonModal from "../TvSeasonModal";
import TvCardPoster from "./TvCardPoster";
import TvCardSeasonsBadge from "./TvCardSeasonsBadge";

interface TvCardProps {
    show: UserTvShow;
}

export function TvCard({ show }: TvCardProps) {
    const [showSeasons, setShowSeasons] = useState(false);

    return (
        <>
            <Card maw={180} bg="transparent" bd={0} shadow="none">
                <TvCardPoster show={show} />
                <Card.Section>
                    <Title order={4} lineClamp={2} fw={500}>
                        {show.title}
                    </Title>
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
