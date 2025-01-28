import { useCommentStore } from "@/stores/commentStore";
import { CommentContent } from "./CommentContent";
import { CommentEditor } from "./CommentEditor";
import { CommentThreadProps } from "./types";
import { usePage } from "@inertiajs/react";
import { ContentType, Auth } from "@/types";
import { notifications } from "@mantine/notifications";
import { InfoIcon } from "lucide-react";

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
    const {
        uiState,
        setReplying,
        setEditing,
        toggleCollapsed,
        addComment,
        editComment,
    } = useCommentStore();
    const isReplying = uiState.isReplying === props.id;
    const isEditing = uiState.isEditing === props.id;
    const isCollapsed = uiState.isCollapsed.includes(props.id);

    const getContentId = () => {
        switch (type) {
            case "animemovie":
                return data.anidb_id;
            case "animetv":
                return data.map_id;
            default:
                return data.id;
        }
    };

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
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to reply",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }

        try {
            const contentId = getContentId();
            if (!contentId) {
                throw new Error("Content ID not found");
            }
            await addComment(
                type,
                contentId,
                content,
                props.id,
                auth.user.username
            );
            setReplying(null);
        } catch (error) {
            notifications.show({
                title: "Error",
                message: "Failed to add reply",
                icon: <InfoIcon />,
                color: "red",
            });
            console.error("Failed to add reply:", error);
        }
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
        if (!auth.user) {
            notifications.show({
                title: "Error",
                message: "You must be logged in to edit",
                icon: <InfoIcon />,
                color: "red",
            });
            return;
        }

        try {
            await editComment(props.id, content);
            setEditing(null);
        } catch (error) {
            notifications.show({
                title: "Error",
                message: "Failed to edit comment",
                icon: <InfoIcon />,
                color: "red",
            });
            console.error("Failed to edit comment:", error);
        }
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
