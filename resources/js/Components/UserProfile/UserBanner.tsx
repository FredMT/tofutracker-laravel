import ResponsiveContainer from "@/Components/ResponsiveContainer";
import { Avatar, Box, Image } from "@mantine/core";
import classes from "./UserBanner.module.css";

interface UserBannerProps {
    bannerUrl?: string;
    avatarUrl?: string;
}

export function UserBanner({
    bannerUrl = "/banner/profilebanner1.webp",
    avatarUrl = "/default-avatar.png",
}: UserBannerProps) {
    return (
        <div className={classes.bannerContainer}>
            <Image
                src={bannerUrl}
                height={320}
                h={320}
                loading="lazy"
                alt="Profile Banner"
                fit="cover"
            />
            <div className={classes.avatarOverlay}>
                <ResponsiveContainer>
                    <div className={classes.avatarWrapper}>
                        <Avatar
                            src={avatarUrl}
                            size={128}
                            radius="50%"
                            style={{
                                border: "4px solid white",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                            variant="transparent"
                        />
                    </div>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default UserBanner;
