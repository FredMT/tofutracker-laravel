import { useCommentStore } from "@/stores/commentStore";
import { ActionIcon, Flex } from "@mantine/core";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useState } from "react";

interface VoteButtonsProps {
    commentId: string;
    author: string | null;
    direction: number;
}

export function VoteButtons({
    commentId,
    author,
    direction: initialDirection,
}: VoteButtonsProps) {
    const vote = useCommentStore((state) => state.vote);
    const currentVote = useCommentStore(
        (state) => state.uiState.votes[commentId]
    );
    const [isVoting, setIsVoting] = useState(false);

    if (author === null) return null;

    const handleVote = async (clickedDirection: "up" | "down") => {
        if (isVoting) return;

        try {
            setIsVoting(true);
            await vote(
                commentId,
                currentVote === clickedDirection ? null : clickedDirection
            );
        } catch (error) {
            console.error("Failed to vote:", error);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <Flex direction="column" align="center" gap="xs" maw={26}>
            <ActionIcon
                onClick={() => handleVote("up")}
                variant="transparent"
                c={currentVote === "up" ? "blue" : "dimmed"}
                disabled={isVoting}
            >
                <ArrowUpIcon className="h-4 w-4" />
            </ActionIcon>
            <ActionIcon
                onClick={() => handleVote("down")}
                variant="transparent"
                c={currentVote === "down" ? "red" : "dimmed"}
                disabled={isVoting}
            >
                <ArrowDownIcon className="h-4 w-4" />
            </ActionIcon>
        </Flex>
    );
}
