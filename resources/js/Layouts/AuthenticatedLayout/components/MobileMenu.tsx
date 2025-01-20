import {PageProps} from "@/types";
import {Link, usePage} from "@inertiajs/react";
import {Button, Stack} from "@mantine/core";

interface MobileMenuProps {
    showingNavigationDropdown: boolean;
}

export default function MobileMenu({
    showingNavigationDropdown,
}: MobileMenuProps) {
    const {
        auth: { user },
    } = usePage<PageProps>().props;
    const url = usePage().url;

    return (
        <div
            className={
                (showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"
            }
        >
            {!user && (
                <Stack p={20}>
                    <Button size="md" component={Link} href={route("search")}>
                        Search
                    </Button>
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
                </Stack>
            )}
            {user && (
                <Stack p={20}>
                    <Button size="md" component={Link} href={route("search")}>
                        Search
                    </Button>
                    <Button size="md" component={Link} href={route("me")}>
                        Profile
                    </Button>
                    <Button
                        size="md"
                        component={Link}
                        href={route("profile.edit")}
                    >
                        Settings
                    </Button>
                    <Button
                        size="md"
                        component={Link}
                        method="post"
                        href={route("logout")}
                    >
                        Log Out
                    </Button>
                </Stack>
            )}
        </div>
    );
}
