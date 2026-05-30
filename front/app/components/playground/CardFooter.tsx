import clsx from "clsx";
import { Sparkles } from "lucide-react";

const CreatureAtk = clsx(
  "absolute bottom-0 left-1 lg:left-2 z-10",
  "text-sky-200 text-xs lg:text-sm lg:font-bold",
);
const CreatureDef = clsx(
  "absolute bottom-0 right-1 lg:right-2 z-10",
  "text-sky-200 text-xs lg:text-sm lg:font-bold",
);
const BuildingDef = clsx(
  "absolute bottom-0 lg:bottom-0.5 left-1/2",
  "-translate-x-1/2 z-10 text-sky-200 text-xs lg:text-sm lg:font-bold",
);
const AbilityIcon = clsx(
  "absolute bottom-0.5 lg:bottom-1 left-1/2",
  "-translate-x-1/2 text-sky-200",
);

type Props = {
  cardType: "creature" | "spell" | "building";
  attack?: number;
  defense?: number;
  ability?: boolean;
  isMobile?: boolean;
};

export default function CardFooter({ cardType, attack, defense, ability, isMobile = false }: Props) {

  // Version mobile
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-0.5 md:hidden">
        {cardType === "creature" && (
          <span className="text-[9px] text-sky-200 font-bold">{attack}/{defense}</span>
        )}
        {cardType === "building" && (
          <span className="text-[9px] text-sky-200 font-bold">🛡{defense}</span>
        )}
        {ability && <Sparkles className="fill-sky-300" size={8} />}
      </div>
    );
  }

  // Version desktop — masquée sur mobile
  switch (cardType) {
    case "creature":
      return (
        <div className="hidden md:contents">
          <div className={CreatureAtk}>{attack}</div>
          <div className={CreatureDef}>{defense}</div>
          {ability && (
            <div className={AbilityIcon}>
              <Sparkles className="fill-sky-300" size={12} />
            </div>
          )}
        </div>
      );
    case "building":
      return <div className={clsx(BuildingDef, "hidden md:flex")}>{defense}</div>;
    case "spell":
      return null;
  }
}