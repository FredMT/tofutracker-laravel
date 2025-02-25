import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { RouteName } from "ziggy-js";
import { route } from "../../vendor/tightenco/ziggy";
import { MantineProvider } from "@mantine/core";
import theme from "@/styles/theme";
import { Notifications } from "@mantine/notifications";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../css/app.css";
import "../css/preflight.css";
import "./bootstrap";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";

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

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) =>
            resolvePageComponent(
                `./Pages/${name}.tsx`,
                import.meta.glob("./Pages/**/*.tsx")
            ),
        setup: ({ App, props }) => {
            /* eslint-disable */
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            return (
                <MantineProvider theme={theme} defaultColorScheme="dark">
                    <QueryClientProvider client={queryClient}>
                        <Notifications />
                        <App {...props} />
                    </QueryClientProvider>
                </MantineProvider>
            );
        },
    })
);
