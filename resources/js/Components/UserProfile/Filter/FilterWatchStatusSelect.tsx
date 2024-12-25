import { useFilterStore } from "@/stores/filterStore";
import { WatchStatusDisplay } from "@/types/enums";
import { Select } from "@mantine/core";

export function FilterWatchStatusSelect() {
    const { status, setStatus } = useFilterStore();

    const watchStatusOptions = Object.entries(WatchStatusDisplay).map(
        ([value, label]) => ({
            value,
            label,
        })
    );

    return (
        <Select
            label="Watch Status"
            placeholder="Select a watch status"
            value={status}
            onChange={setStatus}
            data={watchStatusOptions}
            clearable
        />
    );
}
