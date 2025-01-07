import "../css/app.css";
import "../css/preflight.css";
import "./bootstrap";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import theme from "@/styles/theme";
import { route, type RouteName } from 'ziggy-js';
import { Ziggy as ziggy } from '@/ziggy';

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
            hydrateRoot(
                el,
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    <Notifications />
                    <App {...props} />
                </MantineProvider>
            );
            return;
        }

        // @ts-expect-error
        global.route<RouteName> = (name, params, absolute) =>
            // @ts-expect-error
            route(name, params as any, absolute, {
                ...ziggy,
                // @ts-expect-error
                location: new URL(page.props.ziggy.location)
            });

        createRoot(el).render(
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <Notifications />
                <App {...props} />
            </MantineProvider>
        );
    },
    progress: {
        color: "#b485e5",
    },
});
