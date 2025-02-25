import { Avatar, Box } from "@mantine/core";

interface Props {
    avatarUrl: string;
    size: string;
    containerSize: number;
}

/**
 * Renders an avatar as a notification icon
 */
export default function AvatarIcon({ avatarUrl, size, containerSize }: Props) {
    return (
        <Box
            w={containerSize}
            h={containerSize}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Avatar src={avatarUrl} size={size} radius="xl" />
        </Box>
    );
}
