import type { Movie } from "@/types";
import { Details } from "@/types";
import {
    Grid,
    Text,
    Title
} from "@mantine/core";

export function MovieDetails(props: { details: Movie["details"] }) {
    const { details } = props;

    // Define the display order and labels for crew fields
    const crewFields: Array<{ key: keyof Details; label: string }> = [
        { key: "directors", label: "Director" },
        { key: "writers", label: "Writer" },
        { key: "screenplays", label: "Screenplay" },
        { key: "novels", label: "Novel" },
        { key: "original_stories", label: "Original Story" },
        { key: "producers", label: "Producer" },
    ];

    return (
        <>
            <Title order={3} my={16} style={{ letterSpacing: "0.5px" }}>
                Details
            </Title>
            <Grid columns={6}>
                {/* Show crew members first */}
                {crewFields.map(
                    ({ key, label }) =>
                        details[key] && (
                            <Grid.Col key={key} span={6}>
                                <Grid columns={6}>
                                    <Grid.Col span={2}>
                                        <Text fw={500}>{label}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Text>{details[key]}</Text>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        )
                )}

                {/* Show budget and revenue if they exist */}
                {details.budget && (
                    <Grid.Col span={6}>
                        <Grid columns={6}>
                            <Grid.Col span={2}>
                                <Text fw={500}>Budget</Text>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Text>${details.budget.toLocaleString()}</Text>
                            </Grid.Col>
                        </Grid>
                    </Grid.Col>
                )}

                {details.revenue && (
                    <Grid.Col span={6}>
                        <Grid columns={6}>
                            <Grid.Col span={2}>
                                <Text fw={500}>Revenue</Text>
                            </Grid.Col>
                            <Grid.Col span={4}>
                                <Text>${details.revenue.toLocaleString()}</Text>
                            </Grid.Col>
                        </Grid>
                    </Grid.Col>
                )}
            </Grid>
        </>
    );
}
