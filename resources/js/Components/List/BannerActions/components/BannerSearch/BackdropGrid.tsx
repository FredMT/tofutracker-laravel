import {Button, Grid, Image, Text} from "@mantine/core";
import classes from "./BackdropGrid.module.css";
import {BackdropData} from "@/Components/List/BannerActions/components/BannerSearch/types";

interface BackdropGridProps {
    selectedMovie: BackdropData | null;
    selectedBackdrop: string | null;
    onBackdropSelect: (path: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function BackdropGrid({
    selectedMovie,
    selectedBackdrop,
    onBackdropSelect,
    onSubmit,
    isSubmitting,
}: BackdropGridProps) {
    if (!selectedMovie) {
        return <Text>Please select an item first</Text>;
    }

    if (selectedMovie.backdrops.length === 0) {
        return <Text>No backdrops available for {selectedMovie.title}</Text>;
    }

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                <Grid>
                    {selectedMovie.backdrops.map((backdrop, index) => (
                        <Grid.Col
                            span={{
                                base: 12,
                                sm: 6,
                                md: 4,
                            }}
                            key={index}
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${backdrop.file_path}`}
                                radius="md"
                                onClick={() =>
                                    onBackdropSelect(backdrop.file_path)
                                }
                                style={{
                                    cursor: "pointer",
                                    border:
                                        selectedBackdrop === backdrop.file_path
                                            ? "2px solid var(--mantine-color-blue-filled)"
                                            : "none",
                                }}
                            />
                        </Grid.Col>
                    ))}
                </Grid>
            </div>
            <div className={classes.footer}>
                <Button
                    onClick={onSubmit}
                    loading={isSubmitting}
                    disabled={!selectedBackdrop}
                    fullWidth
                >
                    Set as banner
                </Button>
            </div>
        </div>
    );
}
