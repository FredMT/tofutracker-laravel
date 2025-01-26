import { ActionIcon, Flex, Text } from "@mantine/core";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useCommentStore } from "@/stores/commentStore";

interface VoteButtonsProps {
    commentId: string;
    author: string | null;
}

export function VoteButtons({ commentId, author }: VoteButtonsProps) {
    const { vote, uiState } = useCommentStore();
    const voted = uiState.votes[commentId];

    // Don't show vote buttons for deleted comments
    if (author === null) return null;

    const handleVote = (direction: "up" | "down") => {
        if (voted === direction) {
            vote(commentId, null);
        } else {
            vote(commentId, direction);
        }
    };

    return (
        <Flex direction="column" align="center" gap="xs" maw={26}>
            <ActionIcon
                onClick={() => handleVote("up")}
                variant="subtle"
                c={voted === "up" ? "blue" : "dimmed"}
            >
                <ArrowUpIcon className="h-4 w-4" />
            </ActionIcon>
            <ActionIcon
                onClick={() => handleVote("down")}
                variant="subtle"
                c={voted === "down" ? "red" : "dimmed"}
            >
                <ArrowDownIcon className="h-4 w-4" />
            </ActionIcon>
        </Flex>
    );
}
