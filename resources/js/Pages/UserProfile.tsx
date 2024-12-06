import { Head, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import { Button, Card } from "@mantine/core";
import ThemeButton from "@/Components/ThemeButton";

interface User {
    username: string;
    email: string;
}

export default function UserProfile() {
    const { user } = usePage<PageProps<{ user: User }>>().props;

    return (
        <>
            <Head title="User Profile" />
            <Button autoContrast>Primary Button</Button>
            <ThemeButton />
        </>
    );
}
