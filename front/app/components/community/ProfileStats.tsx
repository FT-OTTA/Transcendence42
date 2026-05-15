import StatCard from "./StatCard";
import clsx from "clsx";

const profileStats = clsx
(
	"flex flex-col"
);

export default function ProfileStats()
{


	return (
		<section className="flex flex-col items-center justify-start gap-4">
			<StatCard label="Played" value="67" />
			<StatCard label="Wins" value="42" />
			<StatCard label="Loses" value="20" />
			<StatCard label="Draws" value="5" />
			<StatCard label="Most played with" value="Tonio" />
			<StatCard label="Worst enemy" value="Kaiba" />
		</section>
	);
};