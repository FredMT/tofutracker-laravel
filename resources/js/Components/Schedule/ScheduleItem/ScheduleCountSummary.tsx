import { formatScheduleCountSummary } from "../utils/formatScheduleCountSummary";

export interface TypeCounts {
    tv: number;
    anime: number;
    formatted_start_date?: string;
    formatted_end_date?: string;
}

function ScheduleCountSummary({ counts }: { counts: TypeCounts }) {
    return formatScheduleCountSummary(counts);
}

export default ScheduleCountSummary;
