import { DeleteButton } from "@/Components/Comments/CommentActions/DeleteButton";
import { EditButton } from "@/Components/Comments/CommentActions/EditButton";
import { ReplyButton } from "@/Components/Comments/CommentActions/ReplyButton";
// import { ShareButton } from "@/Components/Comments/CommentActions/ShareButton";
import { Group } from "@mantine/core";

interface CommentActionsProps {
    commentId: string;
    onReply: () => void;
    onEdit: () => void;
    authorUsername: string | null;
}

export function CommentActions({
    commentId,
    onReply,
    onEdit,
    authorUsername,
}: CommentActionsProps) {
    return (
        <Group gap={8}>
            <ReplyButton onReply={onReply} />
            <EditButton onEdit={onEdit} authorUsername={authorUsername} />
            <DeleteButton
                commentId={commentId}
                authorUsername={authorUsername}
            />
            {/* <ShareButton /> TODO: Add share button */}
        </Group>
    );
}
