import { PageProps } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { Button, Group } from "@mantine/core";
import ThemeButton from "@/Components/ThemeButton";
import Logo from "./Logo";
import UserMenu from "./UserMenu/UserMenu";
import styles from "../AuthenticatedLayout.module.css";

interface NavbarProps {
    isVisible: boolean;
    showingNavigationDropdown: boolean;
    setShowingNavigationDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Navbar({
    isVisible,
    showingNavigationDropdown,
    setShowingNavigationDropdown,
}: NavbarProps) {
    const {
        auth: { user },
    } = usePage<PageProps>().props;
    const url = usePage().url;

    return (
        <nav
            className={`border-b fixed w-full transition-transform duration-300 z-50 backdrop-blur-md ${
                styles.navbar
            } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <Logo />
                    </div>

                    <div className="hidden sm:ms-6 sm:flex sm:items-center">
                        {user ? (
                            <Group>
                                <ThemeButton />
                                <UserMenu />
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
                                    {url.split("/").pop() !== "register" && (
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

                    <div className="-me-2 flex items-center sm:hidden">
                        <ThemeButton />
                        <div className="w-4" />
                        <button
                            onClick={() =>
                                setShowingNavigationDropdown((prev) => !prev)
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
        </nav>
    );
}
