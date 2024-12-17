import { Button, Paper } from "@mantine/core";
import styles from "./EpisodeActions.module.css";
import { CheckCircle2 } from "lucide-react";

export default function EpisodeActions({
    episode_id,
    watched,
}: {
    episode_id: number;
    watched: boolean;
}) {
    return (
        <Paper>
            <Button
                leftSection={<CheckCircle2 size={24} />}
                variant={watched ? "filled" : "outline"}
                size="xs"
                p={4}
                fullWidth
                color="grape"
            />
        </Paper>
    );
}
