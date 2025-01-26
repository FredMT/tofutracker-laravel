import { ActionIcon, Flex, Text } from "@mantine/core";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useState } from "react";

interface VoteButtonsProps {
    initialPoints: number;
}

export function VoteButtons({ initialPoints }: VoteButtonsProps) {
    const [score, setScore] = useState(initialPoints);
    const [voted, setVoted] = useState<"up" | "down" | null>(null);

    const handleVote = (direction: "up" | "down") => {
        if (voted === direction) {
            setScore(initialPoints);
            setVoted(null);
        } else {
            setScore(
                direction === "up" ? initialPoints + 1 : initialPoints - 1
            );
            setVoted(direction);
        }
    };

    return (
        <Flex direction="column" align="center" gap="xs" miw={35}>
            <ActionIcon
                onClick={() => handleVote("up")}
                variant="subtle"
                c="dimmed"
            >
                <ArrowUpIcon className="h-4 w-4" />
            </ActionIcon>
            <Text size="xs">{score}</Text>
            <ActionIcon
                onClick={() => handleVote("down")}
                variant="subtle"
                c="dimmed"
            >
                <ArrowDownIcon className="h-4 w-4" />
            </ActionIcon>
        </Flex>
    );
}
