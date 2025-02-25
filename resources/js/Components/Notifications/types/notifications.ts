export type NotificationSimpleType =
    | "reply"
    | "vote_milestone"
    | "unknown"
    | "commentreply";
export type NotificationFullType =
    | "App\\Notifications\\CommentReplyNotification"
    | "App\\Notifications\\CommentUpvoteNotification";

// Base notification interface with common properties
interface BaseNotification {
    id: string;
    type: NotificationSimpleType | NotificationFullType | string;
    created_at?: string;
    updated_at?: string;
    read_at?: string | null;
}

// Database notification structure (from Laravel controller)
export interface DatabaseNotification extends BaseNotification {
    notifiable_type: string;
    notifiable_id: number;
    data: NotificationData;
}

// Websocket notification structure (from Echo)
export interface WebsocketNotification extends BaseNotification {
    // Direct properties (not nested in data)
    comment_id?: string;
    reply_id?: string;
    link?: string;
    replier?: UserInfo;
    content?: string;
    score_milestone?: string;
}

export interface UserInfo {
    username: string;
    avatar: string | null;
}

// Data structure for nested data in database notifications
export interface NotificationData {
    comment_id?: string;
    reply_id?: string;
    link?: string;
    replier?: UserInfo;
    content?: string;
    score_milestone?: string;
}

// Union type for all notification types
export type Notification = DatabaseNotification | WebsocketNotification;

// Type predicates for specific notification types
export interface ReplyNotificationBase {
    type: "reply" | "App\\Notifications\\CommentReplyNotification";
}

export interface VoteMilestoneNotificationBase {
    type: "vote_milestone" | "App\\Notifications\\CommentUpvoteNotification";
}

export type ReplyNotification = Notification & ReplyNotificationBase;
export type VoteMilestoneNotification = Notification &
    VoteMilestoneNotificationBase;
