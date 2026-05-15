import { useState } from "react";
import clsx from "clsx";

const searchBar = clsx
(
	"pt-3 py-2 items-center",
	"flex flex-col md:flex-row"
)

const searchInput = clsx
(
	"rounded-xl focus:outline-none",
	"bg-sky-900/10 w-3/4 md:w-sm px-3 mx-auto", 
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
	const [search, setSearch] = useState("");
	
	return (
		<section>
			<div className={ searchBar }>
				<input className={ searchInput }
					value={search}
					onChange={(e) => setSearch(e.target.value)
					}
					placeholder="Search player..."
					/>
			</div>
		</section>
	);
};