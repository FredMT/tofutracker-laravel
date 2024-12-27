import { Link, usePage } from "@inertiajs/react";
import { Button, Group } from "@mantine/core";

export default function AuthButtons() {
    const url = usePage().url;

    return (
        <Group gap={8}>
            {url.split("/").pop() !== "login" && (
                <Button href={route("login")} component={Link}>
                    Login
                </Button>
            )}
            {url.split("/").pop() !== "register" && (
                <Button href={route("register")} component={Link}>
                    Register
                </Button>
            )}
        </Group>
    );
}
