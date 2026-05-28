import clsx from "clsx";
import MatchCard from "./MatchCard";
import { customScrollBar } from "../scrollBar";

// placeholder datas
const matches = [
	{ opponent: "Kaiba", score: "2 - 1", result: "win"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "5 - 5", result: "draw"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
	{ opponent: "Tonio", score: "0 - 3", result: "loss"},
]

const matchBox = clsx
(
	"flex flex-col items-center",
	"gap-1 max-h-[500px]"
)

export default function MatchHistory()
{

	const lastMatches = matches.slice(-20);

	return (
		<div className={ customScrollBar }>

			<section className={ matchBox }>
				{lastMatches.map((match, index) => (
					<MatchCard
					key={index}
					opponent={match.opponent}
					score={match.score}
					result={match.result}
					/>
				))}
			</section>

		</div>
	);
};