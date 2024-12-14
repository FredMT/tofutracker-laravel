import "../css/app.css";
import "./bootstrap";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import theme from "@/Components/theme";
import { Notifications } from "@mantine/notifications";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob("./Pages/**/*.tsx")
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <Notifications />
                <App {...props} />
            </MantineProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
