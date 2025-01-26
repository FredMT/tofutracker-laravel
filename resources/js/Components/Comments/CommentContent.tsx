import { Group, Stack } from "@mantine/core";
import { CommentHeader } from "./CommentHeader";
import { VoteButtons } from "./VoteButtons";
import { CommentActions } from "./CommentActions";
import { CommentEditor } from "./CommentEditor";
import { Comment } from "./types";

interface CommentContentProps
    extends Pick<Comment, "id" | "author" | "points" | "timeAgo" | "content"> {
    isCollapsed: boolean;
    onReply: () => void;
    onEdit: () => void;
    isEditing?: boolean;
    onSaveEdit?: (content: string) => void;
    onCancelEdit?: () => void;
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
            <VoteButtons commentId={id} author={props.author} />
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
