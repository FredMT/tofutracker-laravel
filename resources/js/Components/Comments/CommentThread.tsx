import { useCommentStore } from "@/stores/commentStore";
import { CommentContent } from "./CommentContent";
import { CommentEditor } from "./CommentEditor";
import { CommentThreadProps, LINE_COLORS } from "./types";
import { usePage } from "@inertiajs/react";

export function CommentThread({ children, ...props }: CommentThreadProps) {
    const { type, data } = usePage<{ type: string; data: { id: string } }>()
        .props;
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

    const handleReply = () => {
        setReplying(props.id);
    };

    const handleSaveReply = async (content: string) => {
        try {
            await addComment(type, data.id, content, props.id);
            setReplying(null);
        } catch (error) {
            console.error("Failed to add reply:", error);
        }
    };

    const handleCancelReply = () => {
        setReplying(null);
    };

    const handleEdit = () => {
        setEditing(props.id);
    };

    const handleSaveEdit = async (content: string) => {
        try {
            await editComment(props.id, content);
            setEditing(null);
        } catch (error) {
            console.error("Failed to edit comment:", error);
        }
    };

    const handleCancelEdit = () => {
        setEditing(null);
    };

    return (
        <div className="relative">
            <div
                className={`absolute left-0 top-0 bottom-0 w-[3px] ${LINE_COLORS[0]} hover:bg-gray-300 transition-colors cursor-pointer`}
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
                            <CommentThread key={child.id} {...child} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentThread;
