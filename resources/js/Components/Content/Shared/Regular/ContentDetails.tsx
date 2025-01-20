import {useContent} from "@/hooks/useContent";
import {Grid, Text, Title} from "@mantine/core";

type DetailsField = {
    key: string;
    label: string;
};

export function ContentDetails() {
    const { content, type } = useContent();
    if (!content || type === "tvseason" || !("details" in content)) return null;

    const getDetailsFields = (): DetailsField[] => {
        switch (type) {
            case "movie":
                return [
                    { key: "directors", label: "Director" },
                    { key: "writers", label: "Writer" },
                    { key: "screenplays", label: "Screenplay" },
                    { key: "novels", label: "Novel" },
                    { key: "original_stories", label: "Original Story" },
                    { key: "producers", label: "Producer" },
                    { key: "budget", label: "Budget" },
                    { key: "revenue", label: "Revenue" },
                ];
            case "tv":
                return [
                    { key: "creators", label: "Creators" },
                    { key: "episodes", label: "Episodes" },
                    { key: "seasons", label: "Seasons" },
                    { key: "status", label: "Status" },
                    { key: "networks", label: "Networks" },
                    {
                        key: "production_companies",
                        label: "Production Companies",
                    },
                ];
            default:
                return [];
        }
    };

    const formatValue = (key: string, value: any): string => {
        if (key === "budget" || key === "revenue") {
            return `$${value.toLocaleString()}`;
        }
        return value.toString();
    };

    return (
        <>
            <Title order={3} my={16} style={{ letterSpacing: "0.5px" }}>
                Details
            </Title>
            <Grid columns={6}>
                {getDetailsFields().map(
                    ({ key, label }) =>
                        content.details[
                            key as keyof typeof content.details
                        ] && (
                            <Grid.Col key={key} span={6}>
                                <Grid columns={6}>
                                    <Grid.Col span={2}>
                                        <Text fw={500}>{label}</Text>
                                    </Grid.Col>
                                    <Grid.Col span={4}>
                                        <Text>
                                            {formatValue(
                                                key,
                                                content.details[
                                                    key as keyof typeof content.details
                                                ]
                                            )}
                                        </Text>
                                    </Grid.Col>
                                </Grid>
                            </Grid.Col>
                        )
                )}
            </Grid>
        </>
    );
}

export default ContentDetails;
