import { Box, Stack } from "@mantine/core";
import { PropsWithChildren } from "react";

interface UserOverviewLayoutProps {
    leftSection: React.ReactNode;
    rightSection: React.ReactNode;
    leftWidth?: number;
    rightWidth?: number;
    gap?: number;
}

export default function UserOverviewLayout({
    leftSection,
    rightSection,
    leftWidth = 350,
    rightWidth = 600,
    gap = 24,
}: UserOverviewLayoutProps) {
    return (
        <Box>
            {/* Mobile Layout (Stack) */}
            <Box hiddenFrom="md" w="100%">
                <Stack gap={gap}>
                    <Box>{leftSection}</Box>
                    <Box>{rightSection}</Box>
                </Stack>
            </Box>

            {/* Desktop Layout (Side by Side) */}
            <Box visibleFrom="md" w="100%">
                <Box
                    style={{
                        display: "flex",
                        gap: gap,
                    }}
                >
                    <Box style={{ flex: `0 0 ${leftWidth}px` }}>
                        {leftSection}
                    </Box>
                    <Box style={{ flex: `0 0 ${rightWidth}px` }}>
                        {rightSection}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
