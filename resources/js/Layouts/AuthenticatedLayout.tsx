import ThemeButton from "@/Components/ThemeButton";
import { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { Button, Group, Menu, Space, Stack, Text, Title } from "@mantine/core";
import { PropsWithChildren, useEffect, useState } from "react";
import styles from "./AuthenticatedLayout.module.css";
export default function AuthenticatedLayout({
    children,
}: PropsWithChildren<{}>) {
    const {
        auth: { user },
    } = usePage<PageProps>().props;
    const url = usePage().url;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", controlNavbar);

        return () => {
            window.removeEventListener("scroll", controlNavbar);
        };
    }, [lastScrollY]);

    return (
        <div className="min-h-screen relative">
            <nav
                className={`border-b fixed w-full transition-transform duration-300 z-50 backdrop-blur-md ${
                    styles.navbar
                }  ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <Title order={2} c="white">
                                        TOFUTRACKER
                                    </Title>
                                </Link>
                            </div>
                        </div>

                        {/* Show user menu or Login/Register links */}
                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            {user ? (
                                <Group>
                                    <ThemeButton />
                                    <div className="relative ms-3">
                                        <Menu
                                            width={200}
                                            trigger="click-hover"
                                            position="bottom-end"
                                        >
                                            <Menu.Target>
                                                <span className="inline-flex rounded-md">
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-white dark:hover:text-white"
                                                    >
                                                        <Text
                                                            c="white"
                                                            size="sm"
                                                        >
                                                            {user.username}
                                                        </Text>
                                                        <svg
                                                            className="-me-0.5 ms-2 h-4 w-4"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </button>
                                                </span>
                                            </Menu.Target>

                                            <Menu.Dropdown
                                                className={styles.menuDropdown}
                                            >
                                                <Menu.Item
                                                    component={Link}
                                                    href={route("me")}
                                                >
                                                    Profile
                                                </Menu.Item>
                                                <Menu.Item
                                                    component={Link}
                                                    href={route("logout")}
                                                    method="post"
                                                >
                                                    Log Out
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </div>
                                </Group>
                            ) : (
                                <Group gap={16}>
                                    <ThemeButton />
                                    <Group gap={8}>
                                        {url.split("/").pop() !== "login" && (
                                            <Button
                                                href={route("login")}
                                                component={Link}
                                            >
                                                Login
                                            </Button>
                                        )}
                                        {url.split("/").pop() !==
                                            "register" && (
                                            <Button
                                                href={route("register")}
                                                component={Link}
                                            >
                                                Register
                                            </Button>
                                        )}
                                    </Group>
                                </Group>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="-me-2 flex items-center sm:hidden">
                            <ThemeButton />
                            <Space w={15} />
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " sm:hidden"
                    }
                >
                    {/* Show user info and actions in mobile menu only if user is logged in */}
                    {!user && (
                        <Stack p={20}>
                            {url.split("/").pop() !== "login" && (
                                <Button href={route("login")} component={Link}>
                                    Login
                                </Button>
                            )}
                            {url.split("/").pop() !== "register" && (
                                <Button
                                    href={route("register")}
                                    component={Link}
                                >
                                    Register
                                </Button>
                            )}
                        </Stack>
                    )}
                    {user && (
                        <Stack p={20}>
                            <Button
                                size="md"
                                component={Link}
                                href={route("me")}
                            >
                                Profile
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
            </nav>

            <main>{children}</main>
        </div>
    );
}
