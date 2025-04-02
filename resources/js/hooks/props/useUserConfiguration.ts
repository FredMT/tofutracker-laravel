import { usePageProps } from "./usePageProps";

export type UserConfiguration = {
    hide_episode_description: boolean;
    hide_character_name: boolean;
    hide_anime_character_picture: boolean;
};

export function useUserConfiguration(): UserConfiguration {
    const props = usePageProps<{ configuration?: UserConfiguration }>();

    if (!props.configuration) {
        throw new Error("User configuration is missing from page props.");
    }

    return props.configuration as UserConfiguration;
}
