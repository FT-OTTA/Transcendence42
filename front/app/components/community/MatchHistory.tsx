"use client";

import clsx from "clsx";
import MatchCard from "./MatchCard";
import { customScrollBar } from "../scrollBar";
import { useEffect, useState } from "react";

const matchBox = clsx
(
	"flex flex-col items-center",
	"gap-1 max-h-[500px]"
)

export default function MatchHistory({ username }: { username: string }) {
	const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        fetch(`/api/users/history/${username}`)
            .then(r => r.json())
            .then(setMatches);
    }, [username]);

	const lastMatches = matches.slice(-20);

	return (
		<div className={ customScrollBar }>

			<section className={ matchBox }>
				{lastMatches.map((match, index) => (
					<MatchCard
					key={index}
					opponent={match.opponent}
					opponentClass={match.opponentClass}
					score={match.score}
					result={match.result}
					heroClass={match.heroClass}
					/>
				))}
			</section>

		</div>
	);
};