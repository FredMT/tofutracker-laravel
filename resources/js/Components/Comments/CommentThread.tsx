import { Group, Stack, Text } from "@mantine/core";
import { useState } from "react";
import { Comment, LINE_COLORS } from "./types";
import { VoteButtons } from "./VoteButtons";
import { CommentHeader } from "./CommentHeader";
import { CommentActions } from "./CommentActions";
import { CommentEditor } from "./CommentEditor";
import { CommentContent } from "./CommentContent";

interface CommentThreadProps extends Comment {
    onReply?: (parentId: string, content: string) => void;
    onEdit?: (commentId: string, content: string) => void;
}

export function CommentThread({
    children,
    onReply,
    onEdit,
    ...props
}: CommentThreadProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const handleReply = () => {
        setIsReplying(true);
    };

    const handleSaveReply = (content: string) => {
        onReply?.(props.id, content);
        setIsReplying(false);
    };

    const handleCancelReply = () => {
        setIsReplying(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = (content: string) => {
        onEdit?.(props.id, content);
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    return (
        <div className="relative">
            <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${LINE_COLORS[0]} hover:bg-gray-300 transition-colors cursor-pointer`}
                onClick={() => setIsCollapsed(!isCollapsed)}
                role="button"
                tabIndex={0}
                aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsCollapsed(!isCollapsed);
                    }
                }}
            >
                <div className="absolute inset-0 w-6 -left-3" />
            </div>
            <div className="pl-6">
                <CommentContent
                    {...props}
                    isCollapsed={isCollapsed}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    isEditing={isEditing}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                />
                {isReplying && (
                    <div className="mt-4">
                        <CommentEditor
                            onSave={handleSaveReply}
                            onCancel={handleCancelReply}
                            isReply={true}
                        />
                    </div>
                )}
                {!isCollapsed && children && (
                    <div className="mt-2 space-y-6">
                        {children.map((child) => (
                            <CommentThread
                                key={child.id}
                                {...child}
                                onReply={onReply}
                                onEdit={onEdit}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentThread;
