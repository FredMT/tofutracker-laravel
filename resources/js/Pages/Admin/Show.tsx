import {
	Box,
	Button,
	CloseButton,
	Group,
	Input,
	Space,
	Stack,
	Title,
} from '@mantine/core';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout/AuthenticatedLayout';
import axios from 'axios';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { X } from 'lucide-react';
import { router } from '@inertiajs/react';

function Show() {
	const [searchAnidbId, setSearchAnidbId] = useState('');

	const handleShowAnime = () => {
		axios
			.post(route('admin.findAnimeByAnidbId'), {
				animeId: searchAnidbId,
			})
			.then((res) => {
				if (res.status === 200) {
					router.visit(
						route('admin.showAdminAnime', {
							id: searchAnidbId,
						})
					);
				}
			})
			.catch((e) => {
				notifications.show({
					title: 'Error',
					message: e.response.data.message,
					icon: <X />,
					color: 'red',
				});
			});
	};
	return (
		<>
			<Space h={64} />
			<Box
				py={20}
				px={40}
			>
				<Stack>
					<Title>Admin page</Title>

					<Stack>
						<Group>
							<Input
								variant='filled'
								value={searchAnidbId}
								onChange={(event) =>
									setSearchAnidbId(event.currentTarget.value)
								}
								placeholder='Type AniDB ID here'
								rightSectionPointerEvents='all'
								rightSection={
									<CloseButton
										aria-label='Clear input'
										onClick={() => setSearchAnidbId('')}
										style={{ display: searchAnidbId ? undefined : 'none' }}
									/>
								}
							/>
							<Button
								onClick={handleShowAnime}
								disabled={searchAnidbId.length < 1}
							>
								Find anime by AniDB ID
							</Button>
						</Group>
						<Group>
							<Input />
							<FindAnimeCollectionByAniDBID />
						</Group>
					</Stack>
				</Stack>
			</Box>
		</>
	);
}

function FindAnimeCollectionByAniDBID() {
	return <Button>Find anime collection by AniDB ID</Button>;
}

Show.layout = (page: any) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

export default Show;
