import { PropsWithChildren, useEffect, useState } from "react";
import styles from "./AuthenticatedLayout.module.css";
import Logo from "@/Layouts/AuthenticatedLayout/components/Logo";
import MobileMenuButton from "@/Layouts/AuthenticatedLayout/components/MobileMenuButton";
import MobileMenu from "@/Layouts/AuthenticatedLayout/components/MobileMenu";
import { Box, Group } from "@mantine/core";
import SearchBar from "@/Layouts/AuthenticatedLayout/components/UserMenu/SearchBar/SearchBar";
import UserMenu from "@/Layouts/AuthenticatedLayout/components/UserMenu/UserMenu";

export default function AuthenticatedLayout({
    children,
}: PropsWithChildren<{}>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const controlNavbar = () => {
            const currentScrollY = window.scrollY;

            // Don't hide navbar if search is open
            if (isSearchOpen) {
                setIsVisible(true);
                return;
            }

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
    }, [lastScrollY, isSearchOpen]);

    return (
        <div className="min-h-screen relative">
            <nav
                className={`border-b fixed w-full transition-transform duration-300 z-50 backdrop-blur-md ${
                    styles.navbar
                } ${isVisible ? "translate-y-0" : "-translate-y-full"}`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <Group>
                            <Logo />
                            <Box visibleFrom="smmdlg">
                                <SearchBar onOpenChange={setIsSearchOpen} />
                            </Box>
                        </Group>
                        <UserMenu />
                        <MobileMenuButton
                            showingNavigationDropdown={
                                showingNavigationDropdown
                            }
                            setShowingNavigationDropdown={
                                setShowingNavigationDropdown
                            }
                        />
                    </div>
                </div>
                <MobileMenu
                    showingNavigationDropdown={showingNavigationDropdown}
                />
            </nav>

            <main>{children}</main>
        </div>
    );
}
