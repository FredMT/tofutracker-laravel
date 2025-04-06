import { Link, usePage } from "@inertiajs/react";
import { Button, Stack } from "@mantine/core";
import { useAuth } from "@/propsHooks/useAuth";

interface MobileMenuProps {
	showingNavigationDropdown: boolean;
}

export default function MobileMenu({
																		 showingNavigationDropdown,
																	 }: MobileMenuProps) {
	const auth = useAuth();
	const url = usePage().url;

	return (
		<div
			className={
				(showingNavigationDropdown ? "block" : "hidden") + " sm:hidden"
			}
		>
			{!auth.user && (
				<Stack p={20}>
					<Button size="md" component={Link} href={route("search")}>
						Search
					</Button>
					{url.split("/").pop() !== "login" && (
						<Button href={route("login")} component={Link}>
							Login
						</Button>
					)}
					{url.split("/").pop() !== "register" && (
						<Button href={route("register")} component={Link}>
							Register
						</Button>
					)}
				</Stack>
			)}
			{auth.user && (
				<Stack p={20}>
					<Button size="md" component={Link} href={route("search")}>
						Search
					</Button>
					<Button size="md" component={Link} href={route("me")}>
						Profile
					</Button>
					<Button
						size="md"
						component={Link}
						href={route("profile.edit")}
					>
						Settings
					</Button>
					<Button
						size="md"
						component={Link}
						method="post"
						href={route("logout")}
					>
						Log Out
					</Button>
				</Stack>
			)}
		</div>
	);
}
