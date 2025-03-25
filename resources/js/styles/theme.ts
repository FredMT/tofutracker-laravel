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
        fontFamily: `Inter, sans-serif`,
    },
    colors: {
        danger: virtualColor({
            name: "danger",
            light: "red",
            dark: "red",
        }),
    },
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
