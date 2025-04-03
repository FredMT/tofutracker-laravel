import { ActionIcon, Group, Text, TextInput } from '@mantine/core';
import axios from 'axios';
import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

interface EditableTextProps {
	initialText: string;
	animeId: number;
}

export const EditableText: React.FC<EditableTextProps> = ({
	initialText,
	animeId,
}) => {
	const [text, setText] = useState<string>(initialText);
	const [editText, setEditText] = useState<string>(initialText);
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleEditClick = () => {
		setEditText(text);
		setIsEditing(true);
	};

	const handleCancelClick = () => {
		setIsEditing(false);
	};

	const handleSaveClick = async () => {
		if (editText.trim() === text) {
			setIsEditing(false);
			return;
		}
		setIsLoading(true);
		try {
			await axios.put(`/api/anime/${animeId}`, {
				collection_name: editText.trim(),
			});
			setText(editText.trim());
			setIsEditing(false);
			console.log('Updated successfully');
		} catch (error) {
			console.error('Error updating:', error);
		} finally {
			setIsLoading(false);
		}
	};

	if (isEditing) {
		return (
			<Group gap='xs'>
				<TextInput
					value={editText}
					onChange={(event) => setEditText(event.currentTarget.value)}
					placeholder='Enter collection name'
					disabled={isLoading}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							handleSaveClick();
						} else if (e.key === 'Escape') {
							e.preventDefault();
							handleCancelClick();
						}
					}}
				/>
				<ActionIcon
					onClick={handleSaveClick}
					loading={isLoading}
					variant='filled'
					color='teal'
					aria-label='Save'
				>
					<Check size={16} />
				</ActionIcon>
				<ActionIcon
					onClick={handleCancelClick}
					disabled={isLoading}
					variant='filled'
					color='red'
					aria-label='Cancel'
				>
					<X size={16} />
				</ActionIcon>
			</Group>
		);
	}

	return (
		<Group gap='xs'>
			<Text>{text || 'Collection Name not given'}</Text>
			<ActionIcon
				onClick={handleEditClick}
				variant='subtle'
				aria-label='Edit collection name'
			>
				<Pencil size={16} />
			</ActionIcon>
		</Group>
	);
};
