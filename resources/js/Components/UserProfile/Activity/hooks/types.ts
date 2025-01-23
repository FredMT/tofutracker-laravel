export interface Activity {
    activity_type: string;
    id: number;
    description: string;
    occurred_at_diff: string;
    metadata: Record<string, any>;
}
