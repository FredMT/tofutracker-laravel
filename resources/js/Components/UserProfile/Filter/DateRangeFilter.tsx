import {useFilterStore} from "@/stores/filterStore";
import {DatePickerInput} from "@mantine/dates";

interface DateRangeFilterProps {
    placeholder?: string;
}

export function DateRangeFilter({
    placeholder = "Select a date range",
}: DateRangeFilterProps) {
    const { fromDate, toDate, setDateRange } = useFilterStore();

    return (
        <DatePickerInput
            type="range"
            allowSingleDateInRange
            value={[fromDate, toDate]}
            onChange={(value) =>
                setDateRange(value as [Date | null, Date | null])
            }
            clearable
            label="Date Range"
            placeholder={placeholder}
        />
    );
}
