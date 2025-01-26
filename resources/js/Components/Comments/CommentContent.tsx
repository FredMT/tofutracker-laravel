import { Group, Stack } from "@mantine/core";
import { CommentHeader } from "./CommentHeader";
import { VoteButtons } from "./VoteButtons";
import { CommentActions } from "./CommentActions";
import { CommentEditor } from "./CommentEditor";
import { Comment } from "./types";

interface CommentContentProps
    extends Pick<Comment, "author" | "points" | "timeAgo" | "content"> {
    isCollapsed: boolean;
    onReply: () => void;
    onEdit: () => void;
    isEditing?: boolean;
    onSaveEdit?: (content: string) => void;
    onCancelEdit?: () => void;
}

export function CommentContent({
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
            <VoteButtons initialPoints={props.points} />
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
                <CommentActions onReply={onReply} onEdit={onEdit} />
            </Stack>
        </Group>
    );
}
