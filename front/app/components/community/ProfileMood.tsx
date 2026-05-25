"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

type Props = {
	initialMood: string;
	username: string;
};

export default function ProfileMood({ initialMood, username }: Props)
{
	const [currentMood, setCurrentMood] = useState(initialMood);
	const [isOwner, setIsOwner] = useState(false);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);

	useEffect(() => {
		const storedUsername = localStorage.getItem("username");

		setIsOwner(storedUsername === username);
		setLoading(false);
	}, [username]);
	
	async function saveMood(newMood: string) {
	const res =	await fetch(`http://localhost:3000/users/${username}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				moodphrase: newMood,
			}),
		});
	}


	if (loading) {
		return <p className="text-white/40 italic">Loading...</p>;
	}

	if (!isOwner) {
				return <p className="text-white/60 italic whitespace-normal break-words max-w-xs md:max-w-sm">{ currentMood }</p>;
	}

	return editing ?(
		<div>

			<input
				maxLength={100}
				autoFocus
				value={currentMood}
				onChange={(e) => setCurrentMood(e.target.value)}
				onBlur={() => saveMood(currentMood)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						saveMood(currentMood);
						setEditing(false);
					}
				}}
				onBlur={() => {
					saveMood(currentMood);
					setEditing(false);
				}}
				className="focus:outline-none bg-black/30 border border-sky-500 text-white px-2 py-1 rounded"
			/>
			<p className="pt-1 text-xs text-white/40">
				{currentMood.length}/100
			</p>
		</div>
	) : (
		<div className="flex gap-2 items-center">

			<Pencil
				size={14}
				className="text-sky-400"
				/>
			
			<p 
				className="text-white/60 italic cursor-pointer hover:text-white transition whitespace-normal break-words max-w-xs md:max-w-sm"
				onClick={() => setEditing(true)}
				>
				{currentMood || "Click to set your mood"}
			</p>
		</div>
	);
}