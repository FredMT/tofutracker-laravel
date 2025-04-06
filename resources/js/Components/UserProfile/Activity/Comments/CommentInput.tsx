import { Avatar, Button, Flex, TextInput } from '@mantine/core';
import { forwardRef } from 'react';
import styles from './CommentInput.module.css';
import { useAuth } from '@/propsHooks/useAuth';

interface CommentInputProps {
	onPost: () => void;
	placeholder: string;
	value: string;
	onValueChange: (value: string) => void;
	autoFocus?: boolean;
	disabled?: boolean;
}

export const CommentInput = forwardRef<HTMLInputElement, CommentInputProps>(
	(
		{
			onPost,
			placeholder,
			value,
			onValueChange,
			autoFocus = false,
			disabled = false,
		},
		ref
	) => {
		const auth = useAuth();

		const handlePostClick = () => {
			if (value.trim() && !disabled) {
				onPost();
			}
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'Enter' && !event.shiftKey && !disabled) {
				event.preventDefault();
				handlePostClick();
			}
		};

		const userAvatar = auth.user
			? auth.user.avatar
				? `/storage/${auth.user.avatar}`
				: `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${auth.user.username}`
			: '/placeholder.svg?height=32&width=32';

		return (
			<Flex
				gap='sm'
				align='center'
				className={styles.commentInputContainer}
			>
				<Avatar
					src={userAvatar}
					alt={auth.user ? `${auth.user.username}'s avatar` : 'Your avatar'}
					radius='xl'
					size='md'
				/>
				<TextInput
					ref={ref}
					placeholder={placeholder}
					value={value}
					onChange={(event) => onValueChange(event.currentTarget.value)}
					onKeyDown={handleKeyDown}
					disabled={disabled}
					style={{ flex: 1 }}
					styles={{
						input: { padding: 10 },
					}}
					className={styles.textInput}
					rightSectionWidth={100}
					rightSectionProps={{ style: { pointerEvents: 'auto' } }}
					rightSection={
						<Button
							variant='subtle'
							size='sm'
							disabled={disabled || !value.trim()}
							onClick={handlePostClick}
							className={styles.postButton}
						>
							Post
						</Button>
					}
				/>
			</Flex>
		);
	}
);

CommentInput.displayName = 'CommentInput';
