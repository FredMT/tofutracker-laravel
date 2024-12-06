import { createInertiaApp } from "@inertiajs/react";
import createServer from "@inertiajs/react/server";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import ReactDOMServer from "react-dom/server";
import { RouteName } from "ziggy-js";
import { route } from "../../vendor/tightenco/ziggy";
import { ColorSchemeScript } from "@mantine/core";

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
            /* eslint-disable */
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    ...page.props.ziggy,
                    location: new URL(page.props.ziggy.location),
                });
            /* eslint-enable */

            // Add ColorSchemeScript to the head during SSR
            if (typeof document === "undefined") {
                // @ts-ignore
                global.document = {
                    head: {
                        appendChild: <T extends Node>(node: T): T => node,
                    } as unknown as HTMLHeadElement,
                };
                const colorSchemeElement = ReactDOMServer.renderToString(
                    <ColorSchemeScript />
                );
                // @ts-ignore
                global.document = undefined;

                // Inject the ColorSchemeScript into the head
                (page.props as any).head = (page.props as any).head || [];
                (page.props as any).head.push(colorSchemeElement);
            }

            return <App {...props} />;
        },
    })
);
