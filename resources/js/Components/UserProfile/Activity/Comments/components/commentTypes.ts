export interface Comment {
	id: string;
	author: string | null;
	avatar: string | null;
	created_at: number;
	updated_at: number;
	deleted_at: number | null;
	points: number;
	content: string;
	children?: Comment[];
	direction: 0 | 1;
	replyingTo?: string;
}

export interface ReplyTarget {
	commentId: string;
	username: string;
}
