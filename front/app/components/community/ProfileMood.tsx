"use client";

import { useEffect, useState } from "react";

export default function ProfileMood({
	login,
	initialMood,
}: {
	login: string;
	initialMood: string;
}) {
	console.log("INSIDE : login = ", login)
	const [mood, setMood] = useState(initialMood);
	const [isOwner, setIsOwner] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const storedUsername = localStorage.getItem("username");

		setIsOwner(storedUsername === login);
		setLoading(false);
	}, [login]);

	if (loading) {
		return <p className="text-white/40 italic">Loading...</p>;
	}

	if (!isOwner) {
		return <p className="text-white/60 italic">{mood}</p>;
	}

	return (
		<input
			value={mood}
			onChange={(e) => setMood(e.target.value)}
			className="bg-black/30 border border-sky-500 text-white px-2 py-1 rounded"
		/>
	);
}