import { Button, Flex, ScrollArea, Stack, Text, Title } from "@mantine/core";
import classes from "./UserProfileInfo.module.css";
import { Link, usePage } from "@inertiajs/react";

interface UserProfileInfoProps {
    username: string;
    createdAt: string;
}

export function UserProfileInfo({ username, createdAt }: UserProfileInfoProps) {
    const { component } = usePage();
    return (
        <Flex
            direction={{ base: "column", gtmd: "row" }}
            align={{ base: "center", sm: "center" }}
            gap={{ base: 16, gtmd: 80 }}
            className={classes.profileActionSection}
        >
            <Stack gap={0}>
                <Title order={3}>{username}</Title>
                <Text size="sm" c="dimmed">
                    {createdAt}
                </Text>
            </Stack>
            <ScrollArea.Autosize
                type="always"
                scrollHideDelay={500}
                offsetScrollbars
                scrollbarSize={4}
                w={{ base: "100%", sm: "auto" }}
            >
                <Flex gap="md" justify={{ base: "center", sm: "flex-start" }}>
                    <Button bg={`#222222`} bd={0}>
                        Activity
                    </Button>
                    <Button
                        bg={`${
                            component === "UserMovies" ? "violet.9" : "#222222"
                        }`}
                        bd={0}
                        component={Link}
                        href={`/user/${username}/movies`}
                    >
                        Movie list
                    </Button>
                    <Button
                        bg={`${
                            component === "UserTv" ? "violet.9" : "#222222"
                        }`}
                        component={Link}
                        href={`/user/${username}/tv`}
                        bd={0}
                    >
                        TV List
                    </Button>
                    <Button bg={`#222222`} bd={0}>
                        Anime List
                    </Button>
                </Flex>
            </ScrollArea.Autosize>
        </Flex>
    );
}

export default UserProfileInfo;
