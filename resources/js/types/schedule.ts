export type ScheduleItem = {
    id: number;
    title: string;
    episode_date: string;
    episode_number: number;
    episode_name: string;
    season_number: number;
    year: number;
    week: number;
    show_id: number;
    backdrop: string | null;
    logo: string | null;
    poster: string | null;
    link: string;
    type: "tv" | "anime";
};

export type DailySchedule = {
    date: string;
    formatted_date: string;
    day_of_week: string;
    schedules: ScheduleItem[];
};

export type CombinedSchedules = DailySchedule[];

export type TypeCounts = {
    tv: number;
    anime: number;
    formatted_start_date: string;
    formatted_end_date: string;
};
