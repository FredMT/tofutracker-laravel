import { Avatar, Button, Flex, TextInput } from '@mantine/core';
import { forwardRef } from 'react';
import styles from './CommentInput.module.css';

interface CommentInputProps {
	onPost: () => void;
	placeholder: string;
	value: string;
	onValueChange: (value: string) => void;
	autoFocus?: boolean;
}

export const CommentInput = forwardRef<HTMLInputElement, CommentInputProps>(
	({ onPost, placeholder, value, onValueChange, autoFocus = false }, ref) => {
		const handlePostClick = () => {
			if (value.trim()) {
				onPost();
			}
		};

		const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'Enter' && !event.shiftKey) {
				event.preventDefault();
				handlePostClick();
			}
		};

		return (
			<Flex
				gap='sm'
				align='center'
				className={styles.commentInputContainer}
			>
				<Avatar
					src='/placeholder.svg?height=32&width=32'
					alt='Your avatar'
					radius='xl'
					size='md'
				/>
				<TextInput
					ref={ref}
					placeholder={placeholder}
					value={value}
					onChange={(event) => onValueChange(event.currentTarget.value)}
					onKeyDown={handleKeyDown}
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
							disabled={!value.trim()}
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
