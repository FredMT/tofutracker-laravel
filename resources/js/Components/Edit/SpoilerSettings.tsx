import { useState } from "react";
import { Button, Paper, Stack, Switch, Title } from "@mantine/core";
import { Check, InfoIcon, Loader, X } from "lucide-react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { router } from "@inertiajs/react";
import { UserConfiguration } from "@/propsHooks/useUserConfiguration";

interface SpoilerSettingsProps {
	userConfiguration: UserConfiguration;
}

const SpoilerSettings: React.FC<SpoilerSettingsProps> = ({
																													 userConfiguration,
																												 }) => {
	const [hideEpisodeDescription, setHideEpisodeDescription] = useState(
		userConfiguration.hide_episode_description,
	);
	const [hideCharacterName, setHideCharacterName] = useState(
		userConfiguration.hide_character_name,
	);
	const [hideAnimeCharacterPicture, setHideAnimeCharacterPicture] = useState(
		userConfiguration.hide_anime_character_picture,
	);
	const [isPending, setIsPending] = useState(false);

	const handleSaveChanges = () => {
		setIsPending(true);
		axios
			.post(route("profile.updateConfiguration"), {
				hide_episode_description: hideEpisodeDescription,
				hide_character_name: hideCharacterName,
				hide_anime_character_picture: hideAnimeCharacterPicture,
			})
			.then((res) => {
				if (res.status === 200) {
					notifications.show({
						title: "Success",
						message: res.data.message,
						icon: <InfoIcon />,
						color: "green",
					});
				} else {
					notifications.show({
						title: "Error",
						message: res.data.message,
						icon: <X />,
						color: "red",
					});
				}
			})
			.catch(() => {
				notifications.show({
					title: "Error",
					message:
						"Something went wrong trying to update your configuration, please try again later.",
					icon: <X />,
					color: "red",
				});
			})
			.finally(() => {
				router.visit(route("profile.edit"));
			});
	};

	const hasChanges =
		hideEpisodeDescription !== userConfiguration.hide_episode_description ||
		hideCharacterName !== userConfiguration.hide_character_name ||
		hideAnimeCharacterPicture !==
		userConfiguration.hide_anime_character_picture;

	return (
		<Paper shadow="sm" p="md" withBorder>
			<Stack>
				<Title order={4}>Spoiler Settings</Title>
				<Switch
					label="Hide episode descriptions"
					checked={hideEpisodeDescription}
					onChange={(event) =>
						setHideEpisodeDescription(event.currentTarget.checked)
					}
					color="teal"
					thumbIcon={
						hideEpisodeDescription ? (
							<Check
								size={12}
								color="var(--mantine-color-teal-6)"
							/>
						) : (
							<X size={12} color="var(--mantine-color-red-6)" />
						)
					}
				/>
				<Switch
					label="Hide character names of cast"
					checked={hideCharacterName}
					onChange={(event) =>
						setHideCharacterName(event.currentTarget.checked)
					}
					color="teal"
					thumbIcon={
						hideCharacterName ? (
							<Check
								size={12}
								color="var(--mantine-color-teal-6)"
							/>
						) : (
							<X size={12} color="var(--mantine-color-red-6)" />
						)
					}
				/>
				<Switch
					label="Hide anime character pictures"
					checked={hideAnimeCharacterPicture}
					onChange={(event) =>
						setHideAnimeCharacterPicture(
							event.currentTarget.checked,
						)
					}
					color="teal"
					thumbIcon={
						hideAnimeCharacterPicture ? (
							<Check
								size={12}
								color="var(--mantine-color-teal-6)"
							/>
						) : (
							<X size={12} color="var(--mantine-color-red-6)" />
						)
					}
				/>
				{hasChanges && (
					<Button
						onClick={handleSaveChanges}
						color="blue"
						disabled={isPending}
					>
						{isPending ? (
							<>
								<Loader className="animate-spin mr-2" />
								Saving changes{" "}
							</>
						) : (
							"Save Changes"
						)}
					</Button>
				)}
			</Stack>
		</Paper>
	);
};

export default SpoilerSettings;
