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
} from '@mantine/core';
import { Heart } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import styles from './CommentContent.module.css';
import { Comment } from './commentTypes';

dayjs.extend(relativeTime);

interface CommentContentProps {
	comment: Comment;
	onReply: () => void;
	// Add onLike prop if needed, passing commentId or full object
}

export function CommentContent({ comment, onReply }: CommentContentProps) {
	// Destructure necessary fields from comment object
	const {
		author,
		avatar,
		created_at,
		updated_at,
		deleted_at,
		content,
		points,
		replyingTo, // Can be used to show "Replying to @..."
		direction, // Destructure direction
	} = comment;

	const isEdited = created_at !== updated_at;
	const isDeleted = deleted_at !== null;

	// Initialize liked state based on comment.direction
	const [liked, setLiked] = useState(direction === 1);
	const [likeCount, setLikeCount] = useState(points);

	const handleLike = () => {
		// TODO: Implement API call for like/unlike, passing comment.id
		// The API should return the new direction and points
		const newLiked = !liked;
		const newLikeCount = newLiked ? likeCount + 1 : likeCount - 1;

		setLiked(newLiked);
		setLikeCount(newLikeCount);

		// OPTIONAL: Update comment object directly for immediate UI feedback
		// (Be cautious if passing comment object down mutably)
		// comment.direction = newLiked ? 1 : 0;
		// comment.points = newLikeCount;
	};

	// Handle deleted comments
	if (isDeleted) {
		return (
			<Text
				size='sm'
				c='dimmed'
				fs='italic'
			>
				Comment deleted
			</Text>
		);
	}

	return (
		<Flex
			gap='sm'
			className={styles.commentContentContainer}
			py='md'
		>
			<Avatar
				src={
					avatar ??
					`https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${author}`
				}
				alt={`${author ?? 'Anonymous'}'s avatar`}
				radius='xl'
				size='md'
			/>
			<Box style={{ flex: 1, minWidth: 0 }}>
				<Flex
					align='flex-start'
					justify='space-between'
				>
					<Stack
						gap={2}
						style={{ flex: 1, minWidth: 0 }}
					>
						<Text
							size='sm'
							className={styles.commentText}
						>
							<Text
								span
								fw={600}
								mr={4}
							>
								{author ?? 'Removed'} {/* Handle null author */}
							</Text>
							{replyingTo && (
								<Text
									span
									color='blue' // Style as needed
									mr={4}
								>
									@{replyingTo}
								</Text>
							)}
							{content}
							{isEdited && (
								<Text
									span
									size='xs'
									c='dimmed'
									ml={4}
								>
									(edited)
								</Text>
							)}
						</Text>
						<Group
							gap='xs'
							wrap='wrap'
							className={styles.commentMeta}
						>
							<Text
								span
								size='xs'
							>
								{dayjs.unix(created_at).fromNow()}
							</Text>
							{likeCount > 0 && (
								<Text
									span
									size='xs'
								>
									{likeCount} points
								</Text>
							)}
							<Button
								variant='subtle'
								size='compact-xs'
								onClick={onReply}
								className={styles.replyButton}
							>
								Reply
							</Button>
						</Group>
					</Stack>
					<ActionIcon
						variant='subtle'
						color={liked ? 'red' : 'gray'}
						onClick={handleLike}
						size='sm'
						className={styles.likeButton}
					>
						<Heart
							size={16}
							fill={liked ? 'currentColor' : 'none'}
						/>
					</ActionIcon>
				</Flex>
			</Box>
		</Flex>
	);
}
