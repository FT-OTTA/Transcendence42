"use client";
import AvatarFrame from "../AvatarFrame";
import clsx from "clsx";
import { cinzel } from "../../fonts";
import ProfileMood from "./ProfileMood";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useEffect } from "react";

const profileBanner = clsx
(
	"flex flex-col md:flex-row",
	"rounded-xl bg-black/30 backdrop-blur-sm",
	"border border-sky-600/20",
	"items-center justify-center py-3",
	"lg:max-w-4xl md:max-w-3xl mx-auto md:px-10 md:py-3",
);

const userNameClass = clsx
(
	cinzel.className,
	"flex text-2xl md:text-4xl lg:text-5xl text-sky-600",
);

const moodText = clsx
(
	" text-sm flex text-white opacity-60 italic",
);

type ProfileBannerProps = {
	username: string;
	mood: string;
	isOnline: boolean;
	avatarUrl?: string | null;
};

const onlineStatus = clsx
(
	// {isOnline ? "text-sky-500" : "text-red-200"}, 
	" opacity-80 font-bold md:px-5"
)

export default function ProfileBanner({username, mood, isOnline, avatarUrl}: ProfileBannerProps)
{
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		const storedUsername = localStorage.getItem("username");

		setIsOwner(storedUsername?.toLowerCase() === username.toLowerCase());
	}, [username]);

	async function uploadAvatar(file: File)
	{
		const formData = new FormData();
		formData.append("avatar", file);

		await fetch(`http://localhost:3000/users/${username}/avatar`,
		{
			method: "POST",
			body: formData,
		});

		// reload image (simple version)
		window.location.reload();
	}

	const l = useTranslations("Profile");

	return (
		<section className={ profileBanner }>
			<AvatarFrame 
				avatarUrl={avatarUrl}
				isOwner={isOwner}
				onUpload={uploadAvatar}
			/>

			<div className="flex flex-col items-center md:items-start md:px-4 flex-1">
				<h1 className={ userNameClass }> { username } </h1>				
				<div className={ moodText }>
					<ProfileMood
						username={ username }
						initialMood={ mood }
					/>
				</div>
			</div>

			<div className={clsx(onlineStatus, isOnline ? "text-green-100" : "text-red-400")}>
				● { isOnline ? l("online") : l("offline") }
			</div>

		</section>
	);
};