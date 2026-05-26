"use client";

import { useTranslations } from "next-intl";
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
	"transition"
)

type SearchBarProps = {
	onSearch: (username: string) => void;
};

export default function ProfileSearchBar()
{
	const l = useTranslations("Profile");
	const [search, setSearch] = useState("");
	const router = useRouter();

	const handleSearch = () => {
		if (!search.trim())
			return;
		router.push(`/community/${search.trim()}`);
	};

	return (
		<section>
			<div className={ searchBar }>
				<input className={ searchInput }
					value={search}
					onChange={(e) => setSearch(e.target.value)
					}
					placeholder= {l("search_placeholder")}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSearch();
						}
					}}
					/>
			</div>
		</section>
	);
};