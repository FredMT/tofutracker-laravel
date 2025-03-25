import { Button, Paper } from "@mantine/core";
import { CheckCircle2, XCircle } from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import { notifications } from "@mantine/notifications";
import { AnimeSeasonUserLibrary } from "@/types";
import { useState } from "react";
import { AnimeSeason } from "@/types/animeseason";

interface AnimeEpisodeActionsProps {
    episodal_id: number;
}

interface FormErrors {
    message?: string;
    show_id?: string;
    season_id?: string;
    episode_id?: string;
}

export default function AnimeEpisodeActions({
    episodal_id,
}: AnimeEpisodeActionsProps) {
    const { data, user_library } = usePage<{
        data: AnimeSeason;
        user_library: AnimeSeasonUserLibrary;
    }>().props;
    const [isHovered, setIsHovered] = useState(false);
    if (!data) return null;

    const form = useForm({
        tvdb_episode_id: episodal_id,
        anidb_id: data.id,
        map_id: data.map_id,
    });

    const isEpisodeWatched = user_library?.episodes?.some(
        (episodes) =>
            episodal_id === episodes.episode_id &&
            episodes.watch_status === "COMPLETED"
    );

    const handleEpisodeAction = () => {
        if (isEpisodeWatched) {
            form.delete(route("anime.episode.destroy"), {
                preserveScroll: true,
                onSuccess: (res: any) => {
                    if (res.props.flash.success) {
                        notifications.show({
                            title: "Success",
                            message:
                                res.props.flash.message ||
                                "Episode removed from your library",
                            color: "green",
                        });
                    }
                    if (!res.props.flash.success) {
                        notifications.show({
                            title: "Error",
                            message:
                                res.props.flash.message ||
                                "Failed to remove episode from library",
                            color: "red",
                        });
                    }
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
            });
        } else {
            form.post(route("anime.episode.store"), {
                preserveScroll: true,
                onSuccess: (res: any) => {
                    if (res.props.flash.success) {
                        notifications.show({
                            title: "Success",
                            message:
                                res.props.flash.message ||
                                "Episode added to your library",
                            color: "green",
                        });
                    }
                    if (!res.props.flash.success) {
                        notifications.show({
                            title: "Error",
                            message:
                                res.props.flash.message ||
                                "Failed to add episode to library",
                            color: "red",
                        });
                    }
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
    );
}
