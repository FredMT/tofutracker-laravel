import { useCommentStore } from "@/Components/Comments/store/commentStore";
import { usePage } from "@inertiajs/react";
import { ContentType, Auth } from "@/types";
import { notifications } from "@mantine/notifications";
import { InfoIcon } from "lucide-react";
import { CommentContent } from "@/Components/Comments/CommentContent";
import { CommentEditor } from "@/Components/Comments/CommentEditor";
import { CommentThreadProps } from "@/Components/Comments/types";
import { useComments } from "@/Components/Comments/hooks/useComments";
import { useSearchParams } from "@/hooks/useSearchParams";
import { useEffect } from "react";
import { useScrollIntoView } from "@mantine/hooks";
import styles from "./styles/Comments.module.css";
import { clsx } from "clsx";

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

interface ExtendedCommentThreadProps extends CommentThreadProps {
    isHighlighted?: boolean;
}

export function CommentThread({
    children,
    isHighlighted = false,
    ...props
}: ExtendedCommentThreadProps) {
    const { type, data, auth } = usePage<PageProps>().props;
    const { uiState, setReplying, setEditing, toggleCollapsed } =
        useCommentStore();
    const { handleAddComment, handleEditComment } = useComments(
        type,
        data,
        auth
    );
    const { getParam } = useSearchParams();
    const showCommentId = getParam("showCommentId");

    // Setup scroll into view hook
    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
        offset: 60,
        duration: 500,
    });

    const isReplying = uiState.isReplying === props.id;
    const isEditing = uiState.isEditing === props.id;
    const isCollapsed = uiState.isCollapsed.includes(props.id);

    // Scroll into view when highlighted
    useEffect(() => {
        if (isHighlighted && targetRef.current) {
            scrollIntoView({ alignment: "center" });

            // Add highlight class
            const element = targetRef.current;
            element.classList.add(styles.highlightComment);

            // Remove highlight class after animation
            const timer = setTimeout(() => {
                element.classList.remove(styles.highlightComment);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isHighlighted, scrollIntoView]);

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
        <div
            className={styles.commentThread}
            id={`comment-${props.id}`}
            ref={isHighlighted ? targetRef : undefined}
        >
            <div
                className={clsx(
                    styles.commentBar,
                    isHighlighted
                        ? styles.commentBarHighlighted
                        : styles.commentBarNormal
                )}
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
                <div className={styles.commentBarControl} />
            </div>
            <div className={styles.commentContent}>
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
                    <div className={styles.childComments}>
                        {children.map((child) => (
                            <CommentThread
                                key={child.id}
                                {...child}
                                isHighlighted={child.id === showCommentId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default CommentThread;
