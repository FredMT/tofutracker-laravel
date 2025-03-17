import NotificationBellMenu from "@/Components/Notifications/components/NotificationBellMenu";
import ThemeButton from "@/Components/ThemeButton";
import AuthButtons from "@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons";
import UserDropdown from "@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Group } from "@mantine/core";
import ScheduleLinkActionIcon from "./ScheduleLinkActionIcon";

export default function NavbarRight() {
    const {
        auth: { user },
    } = usePage<PageProps>().props;
    const component = usePage().component;
    return (
        <div className="hidden sm:ms-6 sm:flex sm:items-center">
            <Group gap={16}>
                {component !== "Schedule" && <ScheduleLinkActionIcon />}
                <ThemeButton />
                {user && <NotificationBellMenu />}
                {user ? <UserDropdown /> : <AuthButtons />}
            </Group>
        </div>
    );
}
