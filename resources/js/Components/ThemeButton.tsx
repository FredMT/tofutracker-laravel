import {
    ActionIcon,
    useMantineColorScheme,
    useComputedColorScheme,
} from "@mantine/core";
import cx from "clsx";
import classes from "./ThemeButton.module.css";
import { Moon, Sun } from "lucide-react";

export default function ThemeButton() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme("light", {
        getInitialValueInEffect: true,
    });

    return (
        <div>
            <ActionIcon
                onClick={() =>
                    setColorScheme(
                        computedColorScheme === "light" ? "dark" : "light"
                    )
                }
                variant="default"
                size="lg"
                aria-label="Toggle color scheme"
            >
                {computedColorScheme === "dark" && (
                    <Sun className={cx(classes.icon, classes.light)} />
                )}
                {computedColorScheme === "light" && (
                    <Moon className={cx(classes.icon, classes.dark)} />
                )}
            </ActionIcon>
        </div>
    );
}
