"use client";

import StatCard from "./StatCard";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";


export default function ProfileStats({ username }: { username: string })
{
	const l = useTranslations("Stats");
	const [matches, setMatches] = useState<any[]>([]);
	
	useEffect(() => {
        fetch(`http://localhost:3000/users/history/${username}`)
            .then(r => r.json())
            .then(setMatches);
    }, [username]);

	const numPlayed = JSON.stringify(matches.length);
	const wins = JSON.stringify(matches.filter(m => m.result === 'win').length);
	const losses = JSON.stringify(matches.filter(m => m.result === 'loss').length);
	const draws = JSON.stringify(matches.filter(m => m.result === 'draw').length);
	
	const matchOpponents = matches.map(m => m.opponent);
	const matchOpponentCounts: { [key: string]: number } = {};
	matchOpponents.forEach((opponent) => {
		matchOpponentCounts[opponent] = (matchOpponentCounts[opponent] || 0) + 1;
	});
	const sortedmatchOpponents = Object.entries(matchOpponentCounts).sort((a, b) => b[1] - a[1]);
	const bestFriend = sortedmatchOpponents[0]?.[0];

	const lostMatches = matches.filter(m => m.result === 'loss');
	const opponents = lostMatches.map(m => m.opponent);
	const opponentCounts: { [key: string]: number } = {};
	opponents.forEach((opponent) => {
		opponentCounts[opponent] = (opponentCounts[opponent] || 0) + 1;
	});
	const sortedOpponents = Object.entries(opponentCounts).sort((a, b) => b[1] - a[1]);
	const worstEnemy = sortedOpponents[0]?.[0];

	return (
		<section className="flex flex-col items-center justify-start gap-4">
			<StatCard label= {l("num_played")} value={numPlayed} />
			<StatCard label={l("wins")} value={wins} />
			<StatCard label={l("losses")} value={losses} />
			<StatCard label={l("draws")} value={draws} />
			<StatCard label={l("best_friend")} value={bestFriend ?? "None"} />
			<StatCard label={l("worst_enemy")} value={worstEnemy ?? "None"} />
		</section>
	);
};