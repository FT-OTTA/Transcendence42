"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";

const searchBar = clsx
(
	"flex items-center justify-center",
	"gap-2 pt-3 py-2",
)

const searchInput = clsx
(
	"rounded-xl focus:outline-none",
	"bg-sky-900/10 w-48 md:w-96 lg:w-128 md:w-sm px-3", 
	"border focus:border-sky-600/70 border-sky-600/20 backdrop-blur-sm",
	"text-md md:text-xl text-sky-200/70",
	"placeholder:text-sky-200/30 text-center",
	"hover:border-sky-500/30 hover:placeholder:text-sky-200/50",
	"focus-within:border-sky-500 focus-within:placeholder:text-sky-200/50",
	"focus-within:shadow-[0_0_20px_rgba(14,165,233,0.15)]",
	"transition-all duration-200"
)

type SearchBarProps = {
	onSearch: (username: string) => void;
};

export default function ProfileSearchBar()
{
	const [search, setSearch] = useState("");
	const [error, setError] = useState("");
	const [shake, setShake] = useState(false);
	const router = useRouter();

	async function handleSearch() {
		if (!search.trim().toLowerCase())
			return;
		
		setError("");

		const res = await fetch(
			`http://localhost:3000/users/${search}`
		);

		if (!res.ok)
		{
			setError("User not found");
			setShake(true);
			setTimeout(() => {
				setShake(false);
			}, 400);
			return;
		}
		router.push(`/community/${search.trim()}`);
	};

	return (
		<section>
			<div className={ searchBar }>
				<input className={ clsx(
						searchInput,
						error && "focus:text-gray-500 placeholder:text-gray-700",
						shake && "animate-shake"
					)}
					value={search}
					onChange={(e) => 
						{
							setSearch(e.target.value)
							setError("");
						}
						}
					placeholder="Search player..."
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSearch();
						}
					}}
					/>
				{error && (
					<p className="text-gray-600 items-center text-sm mt-2 italic">
						{error}
					</p>
				)}
			</div>
		</section>
	);
};