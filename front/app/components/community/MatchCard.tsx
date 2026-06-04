import clsx from "clsx";

const MatchCardClass = clsx
(
	"grid grid-cols-3",
	"p-2 gap-4",
	"bg-black/20 backdrop-blur-sm",
	"border border-sky-600/30 rounded-xl",
	"transition duration-300",
	"hover:border-sky-600/40 hover:shadow-[0_0_5px_rgba(100,100,255,0.2)]",
	"hover:text-sky-200",
	"min-w-xs md:min-w-sm"
)

type MatchProps = {
	opponent: string;
	score: string;
	result: string;
	heroClass: string;
	oppoClass: string;
};

export default function MatchCard({opponent, score, result, heroClass, oppoClass}:MatchProps)
{

	const resultColor =
	result === "win"
		? "text-sky-400 "
		: result === "loss"
		? "text-gray-500/80"
		: "text-sky-300/70";

	return (
		<div className={MatchCardClass}>
			<div className={clsx("text-center", resultColor)}>
				{ result }
			</div>

			<div className={clsx("text-center", resultColor)}>
				{ opponent }
			</div>

			<div className={clsx("text-center", resultColor)}>
				{ score }
			</div>

			<div className={clsx("text-center", resultColor)}>
				as { heroClass }
			</div>

			<div className={clsx("text-center", resultColor)}>
				as { oppoClass }
			</div>
		</div>
	);
};