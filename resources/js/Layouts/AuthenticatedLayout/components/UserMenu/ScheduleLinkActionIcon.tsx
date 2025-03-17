import { Link } from "@inertiajs/react";
import { ActionIcon } from "@mantine/core";
import { Calendar } from "lucide-react";

function ScheduleLinkActionIcon() {
    return (
        <ActionIcon
            variant="outline"
            size="lg"
            component={Link}
            href="/schedule"
        >
            <Calendar />
        </ActionIcon>
    );
}

export default ScheduleLinkActionIcon;
