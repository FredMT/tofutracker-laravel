import ThemeButton from "@/Components/ThemeButton";
import AuthButtons from "@/Layouts/AuthenticatedLayout/components/UserMenu/AuthButtons";
import UserDropdown from "@/Layouts/AuthenticatedLayout/components/UserMenu/UserDropdown";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Group } from "@mantine/core";

export default function UserMenu() {
    const {
        auth: { user },
    } = usePage<PageProps>().props;
    return (
        <div className="hidden sm:ms-6 sm:flex sm:items-center">
            <Group gap={16}>
                <ThemeButton />
                {user ? <UserDropdown /> : <AuthButtons />}
            </Group>
        </div>
    );
}
