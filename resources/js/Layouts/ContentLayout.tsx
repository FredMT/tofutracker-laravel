import {Flex} from "@mantine/core";
import classes from "./ContentLayout.module.css";

interface Props {
    left: React.ReactNode;
    right: React.ReactNode;
}

function ContentLayout({ left, right }: Props) {
    return (
        <Flex
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 24, sm: 30 }}
            className={classes.contentLayout}
        >
            <div className={classes.leftSection}>{left}</div>
            <div className={classes.rightSection}>{right}</div>
        </Flex>
    );
}

export default ContentLayout;
