import clsx from "clsx";
import { Sparkles } from "lucide-react";

const CreatureAtk = clsx(
	"absolute bottom-0 left-1 lg:left-2 z-10",
  "text-sky-200 text-xs lg:text-sm lg:font-bold",
);

const CreatureDef = clsx(
	"absolute bottom-0 right-2 z-10",
	"text-sky-200 text-sm font-bold",
);

const BuildingDef = clsx(
	"absolute bottom-1 left-1/2",
	"-translate-x-1/2 z-10 text-sky-200 text-sm font-bold",
);

const AbilityIcon = clsx(
	"absolute bottom-1 left-1/2",
	"-translate-x-1/2 text-sky-200",
);

type Props = {
	cardType: "creature" | "spell" | "building";
	attack?: number;
	defense?: number;
	ability?: boolean;
}

export default function CardFooter({
	cardType,
	attack,
	defense,
	ability
}: Props)
{

	switch (cardType)
	{
		case "creature":

			return (
				<>
					<div className={CreatureAtk}>
						{attack}
					</div>

					<div className={CreatureDef}>
						{defense}
					</div>
					{ability && (
						<div className={AbilityIcon}>
							<Sparkles className="fill-sky-300" size={12}/>
						</div>
					)}
				</>
			);

			case "building":

				return (
					<>
					<div className={BuildingDef}>
						{defense}
					</div>
				</>
			);

			case "spell":
				return (null);
	}
}