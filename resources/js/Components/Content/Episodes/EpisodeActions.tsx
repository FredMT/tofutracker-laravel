import {Button, Paper} from "@mantine/core";
import {CheckCircle2, XCircle} from "lucide-react";
import {useForm, usePage} from "@inertiajs/react";
import {notifications} from "@mantine/notifications";
import {BaseUserLibrary, TvSeason} from "@/types";
import {useState} from "react";

interface EpisodeActionsProps {
    episodal_id: number;
}

interface FormErrors {
    message?: string;
    show_id?: string;
    season_id?: string;
    episode_id?: string;
}

export default function EpisodeActions({ episodal_id }: EpisodeActionsProps) {
    const { tvseason, user_library } = usePage<{
        tvseason: TvSeason;
        user_library: BaseUserLibrary;
    }>().props;
    const [isHovered, setIsHovered] = useState(false);

    const form = useForm<{
        episode_id: number;
        show_id?: number;
        season_id?: number;
    }>({
        episode_id: episodal_id,
        show_id: tvseason?.show_id,
        season_id: tvseason?.id,
    });

    const isEpisodeWatched = user_library?.episodes?.some(
        (episodes) =>
            episodal_id === episodes.episode_id &&
            episodes.watch_status === "COMPLETED"
    );

    const handleEpisodeAction = () => {
        if (isEpisodeWatched) {
            form.delete(
                route("tv.episode.destroy", { episode_id: episodal_id }),
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        notifications.show({
                            title: "Success",
                            message: "Episode removed from your library",
                            color: "green",
                        });
                    },
                    onError: (errors: FormErrors) => {
                        notifications.show({
                            title: "Error",
                            message:
                                errors.message ||
                                "Failed to remove episode from library",
                            color: "red",
                        });
                    },
                }
            );
        } else {
            form.post(route("tv.episode.store", { episode_id: episodal_id }), {
                preserveScroll: true,
                onSuccess: () => {
                    notifications.show({
                        title: "Success",
                        message: "Episode added to your library",
                        color: "green",
                    });
                },
                onError: (errors: FormErrors) => {
                    notifications.show({
                        title: "Error",
                        message:
                            errors.message ||
                            "Failed to add episode to library",
                        color: "red",
                    });
                },
            });
        }
    };

    return (
        <Paper>
            <Button
                leftSection={
                    isEpisodeWatched && isHovered ? (
                        <XCircle size={24} />
                    ) : (
                        <CheckCircle2 size={24} />
                    )
                }
                size="xs"
                p={4}
                variant={
                    isEpisodeWatched
                        ? isHovered
                            ? "outline"
                            : "filled"
                        : "outline"
                }
                color={isEpisodeWatched && isHovered ? "red" : "grape"}
                fullWidth
                onClick={handleEpisodeAction}
                loading={form.processing}
                disabled={form.processing}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            />
        </Paper>
    );
}
