import ResponsiveContainer from "@/Components/ResponsiveContainer";
import { Alert, Avatar, Image, Text } from "@mantine/core";
import classes from "./UserBanner.module.css";
import { Link, usePage } from "@inertiajs/react";

interface UserData {
    id: number;
    username: string;
    name: string;
    created_at: string;
    avatar: string;
    banner: string;
    mustVerifyEmail?: boolean;
}

function getRandomBanner() {
    const randomNum = Math.floor(Math.random() * 6);
    return `/banner/userbanner${randomNum}.webp`;
}

export function UserBanner() {
    const { userData } = usePage<{ userData: UserData }>().props;
    return (
        <div className={classes.bannerContainer}>
            {userData.mustVerifyEmail && (
                <Alert>
                    <Text size="sm">
                        Verify your email to unlock all features. Click{" "}
                        <Link href={route("verification.notice")}>
                            <Text span c="blue">
                                here
                            </Text>
                        </Link>{" "}
                        to resend verification email.
                    </Text>
                </Alert>
            )}
            <Image
                src={
                    `https://images.tofutracker.com/${userData.banner}` ||
                    getRandomBanner()
                }
                height={320}
                h={320}
                loading="lazy"
                alt="Profile ListBanner"
                fit="cover"
            />
            <div className={classes.avatarOverlay}>
                <ResponsiveContainer>
                    <div className={classes.avatarWrapper}>
                        <Avatar
                            src={`https://images.tofutracker.com/${userData.avatar}`}
                            size={128}
                            radius="50%"
                            style={{
                                border: "4px solid white",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                            variant="transparent"
                        >
                            <Image
                                src={`https://api.dicebear.com/9.x/open-peeps/svg?seed=tofutracker-${userData.username}`}
                                alt="Avatar"
                                width={20}
                                height={20}
                            />
                        </Avatar>
                    </div>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default UserBanner;
