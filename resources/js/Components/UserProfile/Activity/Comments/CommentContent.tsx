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
import styles from './CommentContent.module.css';

interface CommentContentProps {
	username: string;
	avatar: string;
	content: string;
	time: string;
	likes: number;
	onReply: () => void;
	// Add onLike prop if needed
}

export function CommentContent({
	username,
	avatar,
	content,
	time,
	likes,
	onReply,
}: CommentContentProps) {
	// TODO: Replace with actual like state management (e.g., from parent or hook)
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(likes);

	const handleLike = () => {
		// TODO: Implement API call for like/unlike
		setLiked(!liked);
		setLikeCount(liked ? likeCount - 1 : likeCount + 1);
	};

	return (
		<Flex
			gap='sm'
			className={styles.commentContentContainer}
		>
			<Avatar
				src={avatar}
				alt={`${username} avatar`}
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
								{username}
							</Text>
							{content}
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
								{time}
							</Text>
							{likeCount > 0 && (
								<Text
									span
									size='xs'
								>
									{likeCount} likes
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
