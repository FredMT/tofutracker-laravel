export interface Backdrop {
    file_path: string;
    vote_average: number;
    width: number;
    height: number;
}

export interface BackdropData {
    title: string;
    backdrops: Backdrop[];
}
