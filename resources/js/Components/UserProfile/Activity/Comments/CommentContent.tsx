import { useState } from 'react';
import {
	ActionIcon,
	Avatar,
	Box,
	Button,
	Flex,
	Group,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import {
	Heart,
	Edit,
	Trash2,
	Save,
	X,
	UserCircle,
	MessageCircle,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './CommentContent.module.css';
import { Comment } from './commentTypes';
import { useAuth } from '@/propsHooks/useAuth';

dayjs.extend(relativeTime);

interface CommentContentProps {
	comment: Comment;
	onReply: () => void;
	onEditRequest: (commentId: string, newContent: string) => void;
	onDeleteRequest: (commentId: string) => void;
}

export function CommentContent({
	comment,
	onReply,
	onEditRequest,
	onDeleteRequest,
}: CommentContentProps) {
	const auth = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editedContent, setEditedContent] = useState(comment.content);

	const {
		id,
		author,
		avatar,
		created_at,
		updated_at,
		deleted_at,
		content,
		points,
		replyingTo,
		direction,
	} = comment;

	const isAuthor = auth.user?.username === author;
	const wasEdited = created_at !== updated_at;
	const isDeleted = deleted_at !== null;

	const [liked, setLiked] = useState(direction === 1);
	const [likeCount, setLikeCount] = useState(points);

	const handleLike = () => {
		const newLiked = !liked;
		const newLikeCount = newLiked ? likeCount + 1 : likeCount - 1;
		setLiked(newLiked);
		setLikeCount(newLikeCount);
	};

	const handleEditClick = () => {
		setEditedContent(content);
		setIsEditing(true);
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
	};

	const handleSaveEdit = () => {
		const trimmedContent = editedContent.trim();
		if (trimmedContent && trimmedContent !== content) {
			onEditRequest(id, trimmedContent);
		}
		setIsEditing(false);
	};

	const handleDeleteClick = () => {
		onDeleteRequest(id);
	};

	return (
		<Flex
			gap='sm'
			className={styles.commentContentContainer}
			pb='md'
			style={{ opacity: isDeleted ? 0.6 : 1 }}
		>
			<Avatar
				src={
					isDeleted
						? undefined
						: avatar ??
						  `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${author}`
				}
				alt={isDeleted ? 'Deleted user' : `${author ?? 'Anonymous'}'s avatar`}
				radius='xl'
				size='md'
			>
				{isDeleted && (
					<UserCircle
						size={20}
						strokeWidth={1.5}
					/>
				)}
			</Avatar>
			<Box style={{ flex: 1, minWidth: 0 }}>
				<Flex
					align='flex-start'
					justify='space-between'
				>
					<Stack
						gap={2}
						style={{ flex: 1, minWidth: 0 }}
					>
						<Group
							gap={5}
							align='center'
						>
							<Text
								span
								fw={600}
								size='xs'
								fs={isDeleted ? 'italic' : 'normal'}
								c={isDeleted ? 'dimmed' : 'inherit'}
							>
								{isDeleted ? '[removed]' : author ?? '[removed]'}
							</Text>
							<Text
								span
								size='xs'
								c='dimmed'
							>
								· {dayjs.unix(created_at).fromNow()}
							</Text>
							{wasEdited && !isDeleted && (
								<Text
									span
									size='xs'
									c='dimmed'
									fs='italic'
								>
									(edited)
								</Text>
							)}
						</Group>

						{isEditing && !isDeleted ? (
							<Stack
								gap='xs'
								mt={5}
							>
								<Textarea
									value={editedContent}
									onChange={(event) =>
										setEditedContent(event.currentTarget.value)
									}
									autosize
									minRows={2}
									autoFocus
								/>
								<Group gap='xs'>
									<Button
										size='compact-xs'
										variant='light'
										onClick={handleSaveEdit}
										disabled={!editedContent.trim()}
										leftSection={<Save size={14} />}
									>
										Save
									</Button>
									<Button
										size='compact-xs'
										variant='subtle'
										color='gray'
										onClick={handleCancelEdit}
										leftSection={<X size={14} />}
									>
										Cancel
									</Button>
								</Group>
							</Stack>
						) : (
							<Text
								size={isDeleted ? 'xs' : 'sm'}
								className={styles.commentText}
								mt={2}
								c={isDeleted ? 'dimmed' : 'inherit'}
								fs={isDeleted ? 'italic' : 'normal'}
							>
								{!isDeleted && replyingTo && (
									<Text
										span
										color='blue'
										mr={4}
									>
										@{replyingTo}
									</Text>
								)}
								{content}
							</Text>
						)}

						{!isEditing && !isDeleted && (
							<Group
								gap='xs'
								wrap='wrap'
								className={styles.commentMeta}
								mt={4}
							>
								<Button
									variant='subtle'
									color='green'
									size='compact-xs'
									onClick={onReply}
									leftSection={<MessageCircle size={14} />}
								>
									Reply
								</Button>
								{isAuthor && (
									<>
										<Button
											variant='subtle'
											color='blue'
											size='compact-xs'
											onClick={handleEditClick}
											className={styles.editButton}
											leftSection={<Edit size={14} />}
										>
											Edit
										</Button>
										<Button
											variant='subtle'
											color='red'
											size='compact-xs'
											onClick={handleDeleteClick}
											className={styles.deleteButton}
											leftSection={<Trash2 size={14} />}
										>
											Delete
										</Button>
									</>
								)}
							</Group>
						)}
					</Stack>
					<Group gap={4}>
						{!isEditing && !isDeleted && (
							<ActionIcon
								variant='subtle'
								color={liked ? 'red' : 'gray'}
								onClick={handleLike}
								size='sm'
								className={styles.likeButton}
								ml='sm'
							>
								<Heart
									size={16}
									fill={liked ? 'currentColor' : 'none'}
								/>
							</ActionIcon>
						)}
						{likeCount > 0 && (
							<Text
								span
								size='xs'
							>
								{likeCount}
							</Text>
						)}
					</Group>
				</Flex>
			</Box>
		</Flex>
	);
}
