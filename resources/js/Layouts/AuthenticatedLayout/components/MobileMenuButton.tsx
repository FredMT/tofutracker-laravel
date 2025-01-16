import ThemeButton from "@/Components/ThemeButton";
import {Space} from "@mantine/core";

interface MobileMenuButtonProps {
    showingNavigationDropdown: boolean;
    setShowingNavigationDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MobileMenuButton({
    showingNavigationDropdown,
    setShowingNavigationDropdown,
}: MobileMenuButtonProps) {
    return (
        <div className="-me-2 flex items-center sm:hidden">
            <ThemeButton />
            <Space w={15} />
            <button
                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
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
                            showingNavigationDropdown ? "inline-flex" : "hidden"
                        }
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>
    );
}
