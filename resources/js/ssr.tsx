import "../css/app.css";
import "../css/preflight.css";
import "./bootstrap";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { route, type RouteName } from 'ziggy-js';
import { Ziggy as ziggy } from '@/ziggy';
import { MantineProvider } from "@mantine/core";
import theme from "./styles/theme";
import { Notifications } from "@mantine/notifications";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

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
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                // @ts-expect-error
                route(name, params as any, absolute, {
                    ...ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location)
                });

            return <MantineProvider theme={theme} defaultColorScheme="dark">
                <Notifications />
                <App {...props} />
            </MantineProvider>;
        }
    })
);
