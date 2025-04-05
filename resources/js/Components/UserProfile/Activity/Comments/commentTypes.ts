export interface ReplyType {
	id: string;
	username: string;
	avatar: string;
	content: string;
	replyingTo: string;
	time: string; // Consider using Date type in a real app
	likes: number;
	replies?: ReplyType[]; // Support for nested replies
}

export interface CommentType {
	id: string;
	username: string;
	avatar: string;
	content: string;
	time: string; // Consider using Date type in a real app
	likes: number;
	replies?: ReplyType[];
}

// Add ReplyTarget interface
export interface ReplyTarget {
	commentId: string; // ID of the top-level comment the reply belongs to
	username: string; // Username being replied to (could be comment author or another replier)
}
