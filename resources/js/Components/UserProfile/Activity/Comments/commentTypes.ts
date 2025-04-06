export interface Comment {
	id: string;
	author: string | null;
	avatar: string | null;
	created_at: number;
	updated_at: number;
	deleted_at: number | null;
	points: number;
	content: string;
	children?: Comment[]; // Renamed from replies
	direction: 0 | 1; // What does this represent? This represent whether a user has liked or not liked a comment.
	replyingTo?: string; // Added to keep reply functionality, might need adjustment based on API
}

// Keep ReplyTarget for now, might need adjustment
export interface ReplyTarget {
	commentId: string; // ID of the top-level comment or parent comment being replied to
	username: string; // Username being replied to
}
