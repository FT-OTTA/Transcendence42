import AvatarFrame from "../AvatarFrame";
import clsx from "clsx";
import { cinzel } from "../../fonts";

const profileBanner = clsx
(
	"flex flex-col md:flex-row",
	"rounded-xl bg-black/30 backdrop-blur-sm",
	"border border-sky-600/20",
	"items-center justify-center py-3",
	"lg:max-w-4xl md:max-w-3xl mx-auto md:px-10 md:py-3",
);

const userName = clsx
(
	cinzel.className,
	"flex text-2xl md:text-4xl lg:text-5xl text-sky-600",
);

const moodText = clsx
(
	" text-sm flex opacity-60 italic",
);

type ProfileBannerProps = {
	username: string;
	mood: string;
	isOnline: boolean;
};

const onlineStatus = clsx
(
	// {isOnline ? "text-sky-500" : "text-red-200"}, 
	" opacity-80 font-bold md:px-5"
)


export default function ProfileBanner({username, mood, isOnline}: ProfileBannerProps)
{


	return (
		<section className={ profileBanner }>
			<AvatarFrame />

			<div className="flex flex-col items-center md:items-start md:px-4 flex-1">
				<h1 className={ userName }> { username } </h1>				
				<h2 className={ moodText }> { mood } </h2>
			</div>

			<div className={ onlineStatus }>
				● { isOnline ? "Online" : "Offline" }
			</div>

		</section>
	);
};