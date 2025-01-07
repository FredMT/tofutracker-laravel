import {BannerImage} from "@/Components/Content/Shared/Regular/BannerImage";
import {usePage} from "@inertiajs/react";
import {RegularContentDataType} from "@/types";

export function RegularBannerImageContainer() {
    const {data} = usePage<{ data: RegularContentDataType }>().props;
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
