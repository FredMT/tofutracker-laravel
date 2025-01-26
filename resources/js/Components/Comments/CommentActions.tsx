import { DeleteButton } from "@/Components/Comments/CommentActions/DeleteButton";
import { EditButton } from "@/Components/Comments/CommentActions/EditButton";
import { ReplyButton } from "@/Components/Comments/CommentActions/ReplyButton";
// import { ShareButton } from "@/Components/Comments/CommentActions/ShareButton";
import { Group } from "@mantine/core";

interface CommentActionsProps {
    commentId: string;
    onReply: () => void;
    onEdit: () => void;
}

export function CommentActions({
    commentId,
    onReply,
    onEdit,
}: CommentActionsProps) {
    return (
        <Group gap={8}>
            <ReplyButton onReply={onReply} />
            <EditButton onEdit={onEdit} />
            <DeleteButton commentId={commentId} />
            {/* <ShareButton /> TODO: Add share button */}
        </Group>
    );
}
