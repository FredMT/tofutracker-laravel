import { BannerImage } from "@/Components/Content/Shared/Regular/BannerImage";
import { useRegularContentData } from "@/propsHooks/useRegularContentData";

export function RegularBannerImageContainer() {
	const data = useRegularContentData();
	return (
		<BannerImage
			title={data.title}
			backdrop_path={data.backdrop_path}
			logo_path={data.logo_path}
			genres={data.genres}
			height={540}
		/>
	);
}
