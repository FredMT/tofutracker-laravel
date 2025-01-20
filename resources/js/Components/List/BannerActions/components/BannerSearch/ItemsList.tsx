import {Button, Loader, Stack, Text} from "@mantine/core";
import {BackdropData} from "@/Components/List/BannerActions/components/BannerSearch/types";

interface ItemsListProps {
    loading: boolean;
    error: Error | null;
    data: BackdropData[] | null;
    onItemSelect: (item: BackdropData) => void;
}

export function ItemsList({
    loading,
    error,
    data,
    onItemSelect,
}: ItemsListProps) {
    if (loading) {
        return (
            <Stack align="center" py="xl">
                <Loader />
                <Text size="sm">Loading items...</Text>
            </Stack>
        );
    }

    if (error) {
        return <Text c="red">{error.message}</Text>;
    }

    if (!data || data.length === 0) {
        return <Text>No items available</Text>;
    }

    return (
        <Stack>
            {data.map((item, index) => (
                <Button
                    key={index}
                    variant="subtle"
                    onClick={() => onItemSelect(item)}
                >
                    {item.title}
                </Button>
            ))}
        </Stack>
    );
}
