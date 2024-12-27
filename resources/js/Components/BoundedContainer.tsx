import { Container } from "@mantine/core";
import cx from "clsx";
import classes from "./BoundedContainer.module.css";

function BoundedContainer({ children }: { children: React.ReactNode }) {
    return (
        <Container
            size="responsive"
            classNames={{
                root: cx(classes.boundedContainer),
            }}
        >
            {children}
        </Container>
    );
}

export default BoundedContainer;
