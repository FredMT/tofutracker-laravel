import { Link } from '@inertiajs/react';
import { Avatar, Group, Text } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface CommentHeaderProps {
	author: string | null;
	avatar: string | null;
	points: number;
	created_at: number;
	updated_at: number;
	deleted_at: number | null;
}

export function CommentHeader({
	author,
	points,
	created_at,
	updated_at,
	deleted_at,
	avatar,
}: CommentHeaderProps) {
	let displayTime;

	if (deleted_at) {
		displayTime = `deleted ${dayjs.unix(deleted_at).fromNow()}`;
	} else if (created_at === updated_at) {
		displayTime = dayjs.unix(created_at).fromNow();
	} else {
		displayTime = `${dayjs.unix(created_at).fromNow()} (updated ${dayjs
			.unix(updated_at)
			.fromNow()})`;
	}

	const avatarSrc = avatar
		? `/storage/${avatar}`
		: `https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${author}`;

	return (
		<Group
			gap={8}
			mb={4}
		>
			{author ? (
				<Link href={`/user/${author}`}>
					<Group>
						<Avatar
							size='sm'
							src={avatarSrc}
							alt="it's me"
						/>
						<Text size='sm'>{author ?? '[removed]'}</Text>
					</Group>
				</Link>
			) : (
				<Group>
					<Avatar
						size='sm'
						src={avatarSrc}
						alt="it's me"
					/>
					<Text size='sm'>{author ?? '[removed]'}</Text>
				</Group>
			)}

			<Text size='xs'>{points} points</Text>
			<Text
				size='xs'
				c='dimmed'
			>
				{`${created_at !== updated_at ? 'edited ' : ''}${displayTime}`}
			</Text>
		</Group>
	);
}
