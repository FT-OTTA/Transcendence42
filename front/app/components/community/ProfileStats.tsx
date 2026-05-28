import StatCard from "./StatCard";
import { useTranslations } from "next-intl";

export default function ProfileStats()
{
	const l = useTranslations("Stats");

	return (
		<section className="flex flex-col items-center justify-start gap-4">
			<StatCard label= {l("num_played")} value="67" />
			<StatCard label={l("wins")} value="42" />
			<StatCard label={l("losses")} value="20" />
			<StatCard label={l("draws")} value="5" />
			<StatCard label={l("best_friend")} value="Tonio" />
			<StatCard label={l("worst_enemy")} value="Kaiba" />
		</section>
	);
};