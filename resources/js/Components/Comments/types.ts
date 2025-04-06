export interface Comment {
	id: string;
	author: string | null;
	avatar: string | null;
	points: number;
	created_at: number;
	updated_at: number;
	deleted_at: number | null;
	content: string;
	children?: Comment[];
	direction: number;
}

export interface CommentThreadProps extends Comment {
	children?: Comment[];
}

export interface CommentUIState {
	isReplying: string | null;
	isEditing: string | null;
	isCollapsed: string[];
	votes: Record<string, 'up' | 'down' | null>;
}

export interface CommentsProps {
	comments: Comment[];
	data: {
		id?: string;
		anidb_id?: string;
		map_id?: string;
	};

	[key: string]: any;
}
