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
import {
	ReplyType,
	ReplyTarget,
} from '@/Components/UserProfile/Activity/Comments/commentTypes';
import { Heart } from 'lucide-react';
import styles from './ReplyItem.module.css'; // Reuse or create specific styles

interface ReplyItemProps {
	reply: ReplyType;
	commentId: string;
	setReplyTarget: (target: ReplyTarget | null) => void;
	// Add onLike prop if needed
}

export function ReplyItem({
	reply,
	commentId,
	setReplyTarget,
}: ReplyItemProps) {
	// TODO: Replace with actual like state management
	const [liked, setLiked] = useState(false);
	const [likeCount, setLikeCount] = useState(reply.likes);

	const handleLike = () => {
		// TODO: Implement API call for like/unlike
		setLiked(!liked);
		setLikeCount(liked ? likeCount - 1 : likeCount + 1);
	};

	const handleReply = () => {
		// Now we have the correct commentId
		setReplyTarget({
			commentId: commentId,
			username: reply.username,
		});
	};

	return (
		<Flex
			gap='sm'
			className={styles.replyItemContainer}
		>
			<Avatar
				src={reply.avatar}
				alt={`${reply.username} avatar`}
				radius='xl'
				size='sm' // Slightly smaller avatar for replies
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
							className={styles.replyText}
						>
							<Text
								span
								fw={600}
								mr={4}
							>
								{reply.username}
							</Text>
							<Text
								span
								fw={500}
								c='blue' // Style the @mention
								mr={4}
							>
								@{reply.replyingTo}
							</Text>
							{reply.content}
						</Text>
						<Group
							gap='xs'
							wrap='wrap'
							className={styles.replyMeta}
						>
							<Text
								span
								size='xs'
							>
								{reply.time}
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
								onClick={handleReply}
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
						size='xs' // Smaller like icon for replies
						className={styles.likeButton}
					>
						<Heart
							size={14}
							fill={liked ? 'currentColor' : 'none'}
						/>
					</ActionIcon>
				</Flex>
			</Box>
		</Flex>
	);
}
