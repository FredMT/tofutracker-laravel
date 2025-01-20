import {Box, Stack} from "@mantine/core";

interface UserOverviewLayoutProps {
    leftSection: React.ReactNode;
    rightSection: React.ReactNode;
    leftWidth?: number;
    gap?: number;
}

export default function UserOverviewLayout({
    leftSection,
    rightSection,
    leftWidth = 350,
    gap = 24,
}: UserOverviewLayoutProps) {
    return (
        <Box>
            {/* Mobile Layout (Stack) */}
            <Box hiddenFrom="lg" w="100%">
                <Stack gap={gap}>
                    <Box>{leftSection}</Box>
                    <Box>{rightSection}</Box>
                </Stack>
            </Box>

            {/* Desktop Layout (Side by Side) */}
            <Box visibleFrom="lg" w="100%">
                <Box
                    style={{
                        display: "flex",
                        gap: gap,
                    }}
                >
                    <Box style={{ flex: `0 0 ${leftWidth}px` }}>
                        {leftSection}
                    </Box>
                    <Box style={{ flex: 1 }}>{rightSection}</Box>
                </Box>
            </Box>
        </Box>
    );
}
