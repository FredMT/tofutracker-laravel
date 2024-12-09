export enum WatchStatus {
    COMPLETED = "COMPLETED",
    PLANNING = "PLANNING",
    REWATCHING = "REWATCHING",
    WATCHING = "WATCHING",
    ONHOLD = "ONHOLD",
    DROPPED = "DROPPED",
}

// Add a display mapping
export const WatchStatusDisplay: Record<WatchStatus, string> = {
    [WatchStatus.COMPLETED]: "Completed",
    [WatchStatus.PLANNING]: "Planning",
    [WatchStatus.REWATCHING]: "Rewatching",
    [WatchStatus.WATCHING]: "Watching",
    [WatchStatus.ONHOLD]: "On Hold",
    [WatchStatus.DROPPED]: "Dropped",
};
