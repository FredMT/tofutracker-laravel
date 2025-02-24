import { useCommentStore } from "@/Components/Comments/store/commentStore";
import { CommentContent } from "./CommentContent";
import { CommentEditor } from "./CommentEditor";
import { CommentThreadProps } from "./types";
import { usePage } from "@inertiajs/react";
import { ContentType, Auth } from "@/types";
import { notifications } from "@mantine/notifications";
import { InfoIcon } from "lucide-react";
import { useComments } from "./hooks/useComments";
import React from "react";

interface PageProps {
    type: ContentType;
    data: {
        id?: string;
        anidb_id?: string;
        map_id?: string;
    };
    auth: Auth;
    [key: string]: any;
}

export function CommentThread({ children, ...props }: CommentThreadProps) {
    const { type, data, auth } = usePage<PageProps>().props;
    const { uiState, setReplying, setEditing, toggleCollapsed } =
        useCommentStore();
    const { handleAddComment, handleEditComment } = useComments(
        type,
        data,
        auth
    );

    const isReplying = uiState.isReplying === props.id;
    const isEditing = uiState.isEditing === props.id;
    const isCollapsed = uiState.isCollapsed.includes(props.id);

    const handleReply = () => {
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to reply",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }
        setReplying(props.id);
    };

    const handleSaveReply = async (content: string) => {
        await handleAddComment(content, props.id);
        setReplying(null);
    };

    const handleCancelReply = () => {
        setReplying(null);
    };

    const handleEdit = () => {
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to edit",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }
        setEditing(props.id);
    };

    const handleSaveEdit = async (content: string) => {
        await handleEditComment(props.id, content);
        setEditing(null);
    };

    const handleCancelEdit = () => {
        setEditing(null);
    };

    return (
        <div className="relative">
            <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] bg-gray-700 hover:bg-gray-300 transition-colors cursor-pointer`}
                onClick={() => toggleCollapsed(props.id)}
                role="button"
                tabIndex={0}
                aria-label={isCollapsed ? "Expand comment" : "Collapse comment"}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        toggleCollapsed(props.id);
                    }
                }}
            >
                <div className="absolute inset-0 w-6 -left-3" />
            </div>
            <div className="pl-4">
                <CommentContent
                    {...props}
                    isCollapsed={isCollapsed}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    isEditing={isEditing}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                />
                {isReplying && auth.user && (
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
                            <CommentThread key={child.id} {...child} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentThread;
