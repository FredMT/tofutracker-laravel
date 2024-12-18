import { Button, Paper } from "@mantine/core";
import { CheckCircle2 } from "lucide-react";
import { useForm, usePage } from "@inertiajs/react";
import { notifications } from "@mantine/notifications";
import { PageProps } from "@/types";

interface EpisodeActionsProps {
    episode_id: number;
}

interface FormErrors {
    message?: string;
    show_id?: string;
    season_id?: string;
    episode_id?: string;
}

export default function EpisodeActions({ episode_id }: EpisodeActionsProps) {
    const { tvseason } = usePage<PageProps>().props;

    if (!tvseason) return null;

    const form = useForm<{
        episode_id: number;
        show_id: number;
        season_id: number;
    }>({
        episode_id,
        show_id: tvseason.show_id,
        season_id: tvseason.id,
    });

    const handleEpisodeAction = () => {
        form.post(route("tv.episode.store", { episode_id }), {
            preserveScroll: true,
            onSuccess: () => {
                notifications.show({
                    title: "Success",
                    message: "Episode status updated",
                    color: "green",
                });
            },
            onError: (errors: FormErrors) => {
                notifications.show({
                    title: "Error",
                    message:
                        errors.message || "Failed to update episode status",
                    color: "red",
                });
            },
        });
    };

    return (
        <Paper>
            <Button
                leftSection={<CheckCircle2 size={24} />}
                size="xs"
                p={4}
                variant="outline"
                fullWidth
                color="grape"
                onClick={handleEpisodeAction}
                loading={form.processing}
                disabled={form.processing}
            />
        </Paper>
    );
}
