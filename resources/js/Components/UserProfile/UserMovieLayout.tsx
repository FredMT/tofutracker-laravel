import { Grid } from "@mantine/core";
import { ReactNode } from "react";
import classes from "./UserMovieLayout.module.css";

interface UserMovieLayoutProps {
    leftSection: ReactNode;
    rightSection: ReactNode;
}

export default function UserMovieLayout({
    leftSection,
    rightSection,
}: UserMovieLayoutProps) {
    return (
        <Grid gutter="md">
            <Grid.Col
                span={{ base: 0, gtmd: 3 }}
                visibleFrom="gtmd"
                className={`${classes.borderTop} ${classes.leftColumn}`}
            >
                {leftSection}
            </Grid.Col>
            <Grid.Col
                span={{ base: 12, gtmd: 9 }}
                className={classes.borderTop}
            >
                {rightSection}
            </Grid.Col>
        </Grid>
    );
}
