import { Link, usePage } from "@inertiajs/react";
import { Avatar, Group, Image, Menu, Text } from "@mantine/core";
import styles from "../../AuthenticatedLayout.module.css";
import { Auth, PageProps } from "@/types";

export default function UserDropdown() {
    const { auth } = usePage<{ auth: Auth }>().props;

    if (!auth.user) return null;

    return (
        <div className="relative ms-3">
            <Menu width={200} trigger="click-hover" position="bottom-end">
                <Menu.Target>
                    <span className="inline-flex rounded-md">
                        <button
                            type="button"
                            className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-white dark:hover:text-white"
                        >
                            <Group>
                                <Avatar
                                    src={`https://images.tofutracker.com/${auth.user.avatar}`}
                                    alt="Avatar"
                                    size="sm"
                                >
                                    <Image
                                        src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${auth.user.username}`}
                                        alt="Avatar"
                                        width={20}
                                        height={20}
                                    />
                                </Avatar>
                                <Text c="white" size="sm">
                                    {auth.user.username}
                                </Text>
                            </Group>
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

                <Menu.Dropdown className={styles.menuDropdown}>
                    <Menu.Item component={Link} href={route("me")}>
                        Profile
                    </Menu.Item>
                    <Menu.Item component={Link} href={route("profile.edit")}>
                        Settings
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
    );
}
