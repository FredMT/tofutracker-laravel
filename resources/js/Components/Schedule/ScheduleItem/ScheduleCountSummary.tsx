import { TypeCounts } from "@/types/schedule";
import { formatScheduleCountSummary } from "../utils/formatScheduleCountSummary";

function ScheduleCountSummary({ counts }: { counts: TypeCounts }) {
    return formatScheduleCountSummary(counts);
}

export default ScheduleCountSummary;
