import { Group, Stack } from "@mantine/core";
import { CommentHeader } from "@/Components/Comments/CommentHeader";
import { VoteButtons } from "@/Components/Comments/VoteButtons";
import { CommentActions } from "@/Components/Comments/CommentActions";
import { Comment } from "@/Components/Comments/types";
import { CommentEditor } from "@/Components/Comments/CommentEditor";

interface CommentContentProps
    extends Pick<
        Comment,
        "id" | "author" | "points" | "timeAgo" | "content" | "direction"
    > {
    isCollapsed: boolean;
    onReply: () => void;
    onEdit: () => void;
    isEditing?: boolean;
    onSaveEdit?: (content: string) => void;
    onCancelEdit?: () => void;
    isEdited: boolean;
    isDeleted: boolean;
}

export function CommentContent({
    id,
    isCollapsed,
    onReply,
    onEdit,
    content,
    isEditing,
    onSaveEdit,
    onCancelEdit,
    ...props
}: CommentContentProps) {
    if (isCollapsed) {
        return <CommentHeader {...props} />;
    }

    return (
        <Group gap={8} wrap="nowrap" align="flex-start">
            <VoteButtons
                commentId={id}
                author={props.author}
                direction={props.direction}
            />
            <Stack gap={2} style={{ width: "100%" }}>
                <CommentHeader {...props} />
                {isEditing ? (
                    <CommentEditor
                        onSave={onSaveEdit!}
                        onCancel={onCancelEdit}
                        isReply={true}
                        initialContent={content}
                    />
                ) : (
                    <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
                <CommentActions
                    commentId={id}
                    onReply={onReply}
                    onEdit={onEdit}
                    authorUsername={props.author}
                />
            </Stack>
        </Group>
    );
}
