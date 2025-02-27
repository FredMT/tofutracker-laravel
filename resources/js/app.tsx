import "../css/app.css";
import "../css/preflight.css";
import "./bootstrap";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/tiptap/styles.css";
import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot, hydrateRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import theme from "@/styles/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

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
                    <QueryClientProvider client={queryClient}>
                        <Notifications />
                        <App {...props} />
                    </QueryClientProvider>
                </MantineProvider>
            );
            return;
        }

        createRoot(el).render(
            <MantineProvider theme={theme} defaultColorScheme="dark">
                <QueryClientProvider client={queryClient}>
                    <Notifications />
                    <App {...props} />
                </QueryClientProvider>
            </MantineProvider>
        );
    },
    progress: {
        color: "#b485e5",
    },
});
