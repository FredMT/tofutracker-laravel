import {UserTvShow} from "@/types/userTv";
import {Modal} from "@mantine/core";
import {useMediaQuery} from "@mantine/hooks";
import TvSeasonTable from "./TvSeasonTable";
import TvSeasonVerticalTable from "./TvSeasonVerticalTable";

interface TvSeasonModalProps {
    show: UserTvShow;
    opened: boolean;
    onClose: () => void;
}

export function TvSeasonModal({ show, opened, onClose }: TvSeasonModalProps) {
    const isDesktop = useMediaQuery("(min-width: 40em)");
    const sortedSeasons = show.seasons.sort(
        (a, b) => a.season_number - b.season_number
    );

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={`${show.title} Seasons`}
            size="xl"
            centered
        >
            {isDesktop ? (
                <TvSeasonTable show={show} sortedSeasons={sortedSeasons} />
            ) : (
                <TvSeasonVerticalTable
                    show={show}
                    sortedSeasons={sortedSeasons}
                />
            )}
        </Modal>
    );
}

export default TvSeasonModal;
