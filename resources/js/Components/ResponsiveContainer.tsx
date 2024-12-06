import { Container } from "@mantine/core";
import cx from "clsx";
import classes from "./ResponsiveContainer.module.css";

function ResponsiveContainer({ children }: { children: React.ReactNode }) {
    return (
        <Container
            size="responsive"
            classNames={{
                root: cx(classes.responsiveContainer),
            }}
        >
            {children}
        </Container>
    );
}

export default ResponsiveContainer;
