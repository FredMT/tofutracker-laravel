export type UserConfiguration = {
	hide_episode_description: boolean;
	hide_character_name: boolean;
	hide_anime_character_picture: boolean;
};

import { useTypedPageProps } from "@/propsHooks/useTypedPageProps";

export function useUserConfiguration() {
	const props = useTypedPageProps();
	return props.configuration as unknown as UserConfiguration;
}