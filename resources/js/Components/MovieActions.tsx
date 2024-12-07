import {Button, Select, Stack} from "@mantine/core";
import {PlusCircle, Star} from "lucide-react";

export function MovieActions() {
    return <Stack gap={8} w={"100%"}>
        <Button
            fullWidth
            leftSection={<PlusCircle size={14}/>}
        >
            Add to Library
        </Button>
        <Button
            fullWidth
            variant="light"
            leftSection={<Star size={14}/>}
        >
            Rate
        </Button>
        <Select
            placeholder="Choose Status"
            data={["Completed", "Watching", "Dropped"]}
        />
    </Stack>;
}
