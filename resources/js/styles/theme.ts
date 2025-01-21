import { Carousel } from "@mantine/carousel";
import {
    Card,
    Container,
    createTheme,
    Modal,
    rem,
    Select,
    virtualColor,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "./theme.module.css";

const CONTAINER_SIZES: Record<string, string> = {
    xxs: rem("200px"),
    xs: rem("350px"),
    sm: rem("640px"),
    md: rem("768px"),
    lg: rem("1024px"),
    xl: rem("1400px"),
    xxl: rem("1600px"),
};

const theme = createTheme({
    breakpoints: {
        xs: "20em",
        xssm: "25em",
        sm: "40em",
        md: "48em",
        gtmd: "53.75em",
        smmdlg: "56em",
        smlg: "56.25em",
        mdlg: "62.5em",
        lg: "64em",
        xl: "80em",
    },
    fontFamily: "Inter, sans-serif",
    headings: {
        // Use default theme if you want to provide default Mantine fonts as a fallback
        fontFamily: `Inter, sans-serif`,
    },
    colors: {
        // zinc: zincColors,
        // slate: slateColors,
        // stone: stoneColors,
        // gray: grayColors,
        // neutral: neutralColors,
        // red: redColors,
        // rose: roseColors,
        // orange: orangeColors,
        // green: greenColors,
        // blue: blueColors,
        // yellow: yellowColors,
        // violet: violetColors,
        // primary: zincColors,
        // secondary: zincColors, // secondary will be dynamically changed baesd on the primary color
        // dark: zincColors, // dark will always be secondary color
        // error: redColors,
        // warning: amberColors,
        // success: greenColors,
        danger: virtualColor({
            name: "danger",
            light: "red",
            dark: "red",
        }),
    },
    // scale: 1,
    // primaryColor: "primary",
    // primaryShade: { light: 8, dark: 0 },
    // autoContrast: true,
    // luminanceThreshold: 0.3,
    // fontFamily: "Inter, sans-serif",
    // fontFamilyMonospace: "Monaco, Courier, monospace",
    // radius: {
    //     xs: rem("6px"),
    //     sm: rem("8px"),
    //     md: rem("12px"),
    //     lg: rem("16px"),
    //     xl: rem("24px"),
    // },
    // defaultRadius: "sm",
    spacing: {
        "3xs": rem("4px"),
        "2xs": rem("8px"),
        xs: rem("10px"),
        sm: rem("12px"),
        md: rem("16px"),
        lg: rem("20px"),
        xl: rem("24px"),
        "2xl": rem("28px"),
        "3xl": rem("32px"),
    },
    // fontSizes: {
    //     xs: rem("12px"),
    //     sm: rem("14px"),
    //     md: rem("16px"),
    //     lg: rem("18px"),
    //     xl: rem("20px"),
    //     "2xl": rem("24px"),
    //     "3xl": rem("30px"),
    //     "4xl": rem("36px"),
    //     "5xl": rem("48px"),
    // },
    // lineHeights: {
    //     xs: rem("18px"),
    //     sm: rem("20px"),
    //     md: rem("24px"),
    //     lg: rem("28px"),
    // },
    // headings: {
    //     fontFamily: "Greycliff CF, sans-serif",
    //     sizes: {
    //         h1: {
    //             fontSize: rem("36px"),
    //             lineHeight: rem("44px"),
    //             fontWeight: "600",
    //         },
    //         h2: {
    //             fontSize: rem("30px"),
    //             lineHeight: rem("38px"),
    //             fontWeight: "600",
    //         },
    //         h3: {
    //             fontSize: rem("24px"),
    //             lineHeight: rem("32px"),
    //             fontWeight: "600",
    //         },
    //         h4: {
    //             fontSize: rem("20px"),
    //             lineHeight: rem("30px"),
    //             fontWeight: "600",
    //         },
    //     },
    // },
    // shadows: {
    //     xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
    //     sm: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
    //     md: "0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)",
    //     lg: "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
    //     xl: "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
    //     xxl: "0 25px 50px rgba(0, 0, 0, 0.25)",
    // },
    // cursorType: "pointer",
    // other: {
    //     style: "shadcn",
    // },
    // variantColorResolver: (component) => {
    //     const defaultResolvedColors = defaultVariantColorsResolver(component);
    //     if (component.variant === "default") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "var(--mantine-color-default)",
    //             border: "1px solid var(--mantine-color-default-border)",
    //             hover: "var(--mantine-color-default-hover)",
    //         };
    //     }
    //     if (component.variant === "filled") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "var(--mantine-primary-color-filled)",
    //             hover: "var(--mantine-primary-color-filled-hover)",
    //             color: "var(--mantine-primary-color-contrast)",
    //         };
    //     }
    //     if (component.variant === "light") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "var(--mantine-primary-color-light)",
    //             hover: "var(--mantine-primary-color-light-hover)",
    //             color: "var(--mantine-primary-color-light-color)",
    //         };
    //     }
    //     if (component.variant === "outline") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "var(--mantine-color-default)",
    //             border: "1px solid var(--mantine-color-default-border)",
    //             hover: "var(--mantine-color-default-hover)",
    //             color: "var(--mantine-color-default-color)",
    //         };
    //     }
    //     if (component.variant === "subtle") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "transparent",
    //             hover: "var(--mantine-color-default-hover)",
    //             color: "var(--mantine-color-default-color)",
    //         };
    //     }
    //     if (component.variant === "danger") {
    //         return {
    //             ...defaultResolvedColors,
    //             background: "var(--mantine-color-danger-6)",
    //             hover: "var(--mantine-color-danger-7)",
    //             color: "var(--mantine-color-white)",
    //         };
    //     }
    //     return defaultResolvedColors;
    // },
    components: {
        Container: Container.extend({
            vars: (_, { size, fluid }) => ({
                root: {
                    "--container-size": fluid
                        ? "100%"
                        : size !== undefined && size in CONTAINER_SIZES
                        ? CONTAINER_SIZES[size]
                        : rem(size),
                },
            }),
        }),
        Card: Card.extend({
            defaultProps: {
                p: "xl",
                shadow: "xl",
                radius: "md",
                withBorder: true,
            },
            classNames: (theme) => ({
                root: "globalMantineCardRoot",
            }),
        }),
        Carousel: Carousel.extend({
            classNames: (theme) => ({
                control: "rounded",
            }),
        }),
        Select: Select.extend({
            styles: {
                input: {
                    backgroundColor: "transparent",
                    borderColor: "light-dark(#222222, #2e2e2e)",
                },
                dropdown: {
                    backgroundColor: "light-dark(#2e2e2e, #121212)",
                    borderColor: "light-dark(#222222, #2e2e2e)",
                },
            },
        }),
        DatePickerInput: DatePickerInput.extend({
            styles: {
                input: {
                    backgroundColor: "transparent",
                    borderColor: "light-dark(#222222, #2e2e2e)",
                },
            },
        }),
        Modal: Modal.extend({
            defaultProps: {
                overlayProps: {
                    backgroundOpacity: 0.55,
                    blur: 3,
                },
                centered: true,
            },
        }),
    },
});

export default theme;
