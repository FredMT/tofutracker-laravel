import { CardFanReveal } from '@/Components/UserProfile/Activity/CardFanReveal';
import { Link } from '@inertiajs/react';
import {
	AspectRatio,
	Box,
	Button,
	Card,
	Center,
	Collapse,
	Grid,
	Group,
	Image,
	Stack,
	Text,
} from '@mantine/core';
import {
	useDisclosure,
	useHover,
	useMediaQuery,
	useScrollIntoView,
} from '@mantine/hooks';
import { Clock, MessageCircle } from 'lucide-react';
import styles from './ActivityListItem.module.css';
import { useActivityItemType } from '@/Components/UserProfile/Activity/hooks/useActivityItemType';
import { useActivityItemDetails } from '@/Components/UserProfile/Activity/hooks/useActivityItemDetails';
import { useActivityDescription } from '@/Components/UserProfile/Activity/hooks/useActivityDescription';
import { useActivityPoster } from '@/Components/UserProfile/Activity/hooks/useActivityPoster';
import { Activity } from '@/Components/UserProfile/Activity/activityType';
import { ActivityLike } from '@/Components/UserProfile/Activity/ActivityLike';
import { CommentSection } from '@/Components/UserProfile/Activity/Comments/components/CommentSection';
import { useSearchParams } from '@/hooks/useSearchParams';
import { useEffect } from 'react';

interface ActivityListItemProps {
	activity: Activity;
}

export function ActivityListItem({ activity }: ActivityListItemProps) {
	const posterPath = useActivityPoster(activity);
	const itemType = useActivityItemType(activity);
	const { itemLink, itemTitle } = useActivityItemDetails(activity);
	const description = useActivityDescription(activity, itemLink, itemTitle);
	const min_sm_width = useMediaQuery('(min-width: 640px)');
	const { getParam } = useSearchParams();
	const activityId = getParam('activityId');
	const showCommentId = getParam('showCommentId');
	const parentId = getParam('parentId');

	const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
		offset: 60,
		duration: 700,
	});

	// Auto-open comments if this activity is being referenced
	const [commentsOpened, { toggle: toggleComments, open: openComments }] =
		useDisclosure(activityId === activity.id.toString());
	const { hovered, ref } = useHover();

	const commentCount = activity.comments.commentCount ?? 0;

	const isEpisodeWatch =
		itemType === 'tv_episode' || itemType === 'anime_episode';
	const isListItemAdd = activity.activity_type === 'list_item_add';

	// Scroll into view when this activity is being referenced
	useEffect(() => {
		if (activityId === activity.id.toString() && targetRef.current) {
			scrollIntoView({ alignment: 'center' });

			if (!showCommentId && !parentId) {
				const element = targetRef.current;
				element.classList.add(styles.highlightActivity);

				// Remove highlight class after animation
				const timer = setTimeout(() => {
					element.classList.remove(styles.highlightActivity);
				}, 2000);

				return () => clearTimeout(timer);
			}
		}
	}, [activityId, activity.id, scrollIntoView, showCommentId, parentId]);

	// Auto-open comments when parentId or showCommentId is present
	useEffect(() => {
		if ((parentId || showCommentId) && activityId === activity.id.toString()) {
			openComments();
		}
	}, [parentId, showCommentId, activityId, activity.id]);

	const ImageComponent = () =>
		isEpisodeWatch ? (
			<AspectRatio
				ratio={16 / 9}
				w={100}
			>
				<Image
					src={posterPath}
					alt={activity.description}
					loading='lazy'
					radius='md'
				/>
			</AspectRatio>
		) : (
			<AspectRatio
				ratio={2 / 3}
				w={100}
			>
				<Image
					src={posterPath}
					alt={activity.description}
					loading='lazy'
					radius='md'
				/>
			</AspectRatio>
		);

	return (
		<Card
			key={activity.id}
			radius='md'
			withBorder={false}
			p={8}
			className={styles.card}
			ref={activityId === activity.id.toString() ? targetRef : undefined}
		>
			<Grid>
				{min_sm_width && (
					<Grid.Col span='content'>
						<Box
							ref={ref}
							className={styles.imageColumn}
							data-expanded={hovered}
						>
							<Center>
								{isListItemAdd ? (
									<CardFanReveal items={activity.metadata.items} />
								) : (
									posterPath &&
									(itemLink ? (
										<Link href={itemLink}>
											<ImageComponent />
										</Link>
									) : (
										<ImageComponent />
									))
								)}
							</Center>
						</Box>
					</Grid.Col>
				)}
				<Grid.Col span='auto'>
					<Stack
						gap={0}
						justify='flex-end'
						h='100%'
						pb={10}
					>
						<Group
							gap={4}
							align='center'
							wrap='wrap'
							hiddenFrom='sm'
						>
							<Clock size={16} />
							<Text
								span
								size='sm'
							>
								{activity.occurred_at_diff}
							</Text>
						</Group>
						<Text
							span
							size='sm'
						>
							{description}
						</Text>
					</Stack>
				</Grid.Col>
				<Grid.Col span='content'>
					<Stack
						gap={20}
						align='flex-end'
						justify={min_sm_width ? 'space-between' : 'flex-end'}
						h='100%'
					>
						<Group
							gap={4}
							align='center'
							wrap='wrap'
							visibleFrom='sm'
						>
							<Clock size={16} />
							<Text
								span
								size='sm'
							>
								{activity.occurred_at_diff}
							</Text>
						</Group>
						<Group
							gap={4}
							pb={10}
						>
							<ActivityLike
								activityId={activity.id}
								initialLikesCount={activity.likes_count}
								isLiked={activity.is_liked}
							/>
							<Button
								variant='subtle'
								size='compact-xs'
								color='gray'
								onClick={toggleComments}
								className={styles.commentButton}
							>
								<Group gap={4}>
									<MessageCircle size={16} />
									{commentCount > 0 && (
										<Text
											span
											size='sm'
										>
											{commentCount}
										</Text>
									)}
								</Group>
							</Button>
						</Group>
					</Stack>
				</Grid.Col>
			</Grid>

			<Collapse in={commentsOpened}>
				<Box>
					<CommentSection
						activityId={activity.id}
						initialComments={activity.comments.comments}
					/>
				</Box>
			</Collapse>
		</Card>
	);
}
