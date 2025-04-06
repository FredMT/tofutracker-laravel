import { create } from "zustand";
import { useEffect, useMemo } from "react";
import { UserConfiguration, useUserConfiguration } from "@/propsHooks/useUserConfiguration";

interface SpoilerState {
	initialConfiguration: UserConfiguration | null;
	showSpoilers: boolean;
	setInitialConfiguration: (config: UserConfiguration) => void;
	setShowSpoilers: (show: boolean) => void;
}

interface SpoilerConfigurationHookReturn {
	configuration: UserConfiguration;
	mustShowSpoilerSwitch: boolean;
	showSpoilers: boolean;
	setShowSpoilers: (show: boolean) => void;
}

const defaultConfiguration: UserConfiguration = {
	hide_episode_description: false,
	hide_character_name: false,
	hide_anime_character_picture: false,
};

const useSpoilerStore = create<SpoilerState>((set) => ({
	initialConfiguration: null,
	showSpoilers: false,

	setInitialConfiguration: (config) => set({ initialConfiguration: config }),
	setShowSpoilers: (show) => set({ showSpoilers: show }),
}));

export function useSpoilerConfiguration(): SpoilerConfigurationHookReturn {
	const serverConfiguration = useUserConfiguration();

	const {
		initialConfiguration,
		showSpoilers,
		setInitialConfiguration,
		setShowSpoilers,
	} = useSpoilerStore();

	useEffect(() => {
		if (
			serverConfiguration &&
			serverConfiguration !== initialConfiguration
		) {
			setInitialConfiguration(serverConfiguration);
		}
	}, [serverConfiguration, initialConfiguration, setInitialConfiguration]);

	const mustShowSpoilerSwitch = useMemo(() => {
		if (!initialConfiguration) {
			return false;
		}

		return (
			initialConfiguration.hide_episode_description ||
			initialConfiguration.hide_character_name ||
			initialConfiguration.hide_anime_character_picture
		);
	}, [initialConfiguration]);

	const configuration = useMemo((): UserConfiguration => {
		if (!initialConfiguration) {
			return defaultConfiguration;
		}

		if (showSpoilers) {
			return {
				hide_episode_description: false,
				hide_character_name: false,
				hide_anime_character_picture: false,
			};
		}

		return initialConfiguration;
	}, [initialConfiguration, showSpoilers]);

	return {
		configuration,
		mustShowSpoilerSwitch,
		showSpoilers,
		setShowSpoilers,
	};
}
