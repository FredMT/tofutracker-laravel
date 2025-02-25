import { Box } from "@mantine/core";
import { LucideIcon } from "lucide-react";

interface Props {
    IconComponent: LucideIcon;
    size: number;
    containerSize: number;
    color?: string;
    fill?: string;
    stroke?: string;
}

/**
 * Renders a symbol icon for a notification
 */
export default function SymbolIcon({
    IconComponent,
    size,
    containerSize,
    color,
    fill,
    stroke,
}: Props) {
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
            <IconComponent
                size={size}
                color={color}
                fill={fill}
                stroke={stroke}
            />
        </Box>
    );
}
