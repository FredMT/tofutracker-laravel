import {Badge, Group, Text} from "@mantine/core";
import {getLanguageName} from "@/utils/formatter";

export function MovieSummary(props: {
    voteAverage: number;
    releaseDate: string;
    runtime: number;
    isoCode: string;
    right: any;
}) {
    return (
        <Group wrap="wrap" gap={36} preventGrowOverflow>
            {props.voteAverage && (
                <Badge variant="outline">{props.voteAverage.toFixed(2)}</Badge>
            )}
            {props.releaseDate && <Text>{props.releaseDate}</Text>}
            {props.runtime && <Text>{props.runtime}</Text>}
            <Text>{getLanguageName(props.isoCode)}</Text>
            <Text>{props.right}</Text>
        </Group>
    );
}
