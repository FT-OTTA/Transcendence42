import clsx from "clsx";

interface HeroStripProps {
  label: string;
  playerClass?: "Druid" | "Warrior";
  armor: number;
  dmgDealt: number;
  curRunes?: number;
  handCount?: number;
  deckCount: number;
  isHighlighted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  isOpponent?: boolean;
}

const strip = clsx(
  "flex items-center justify-between gap-4",
  "px-4 py-2 rounded-sm",
  "bg-black/20 backdrop-blur-sm",
  "text-xs transition-all",
);

const stat = clsx("flex flex-col items-center gap-0.5");
const statLabel = clsx("text-blue-200/50 uppercase tracking-wider text-[9px]");
const statValue = clsx("font-bold text-blue-200");

export default function HeroStrip({
  label,
  playerClass,
  armor,
  dmgDealt,
  curRunes,
  handCount,
  deckCount,
  isHighlighted = false,
  isSelected = false,
  onClick,
  isOpponent = false,
}: HeroStripProps) {
  const isClickable = isHighlighted || isSelected;

  const stripClass = clsx(
    strip,
    isSelected && (isOpponent
      ? "ring-4 ring-orange-500 bg-orange-500/20"
      : "ring-4 ring-green-500 bg-green-500/20"),
    isHighlighted && !isSelected && "ring-2 ring-yellow-400/80 cursor-pointer",
    isClickable && "cursor-pointer",
  );

  return (
    <div className={stripClass} onClick={() => isClickable && onClick?.()}>

      <div className="flex flex-col min-w-[60px]">
        <span className={clsx(
          "font-semibold md:text-sm lg:text-lg",
          isOpponent ? "text-red-300" : "text-sky-300"
        )}>
          {label}
        </span>
        {playerClass && (
          <span className="text-[9px] text-blue-200/40 uppercase">{playerClass}</span>
        )}
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <div className={stat}>
          <span className={statLabel}>Armor</span>
          <span className={statValue}>{armor}</span>
        </div>
        <div className={stat}>
          <span className={statLabel}>Score</span>
          <span className={clsx(statValue, "text-red-400")}>{dmgDealt}</span>
        </div>
        {curRunes !== undefined && (
          <div className={stat}>
            <span className={statLabel}>Runes</span>
            <span className={clsx(statValue, "text-yellow-400")}>{curRunes}</span>
          </div>
        )}
        {handCount !== undefined && (
          <div className={stat}>
            <span className={statLabel}>Hand</span>
            <span className={clsx(statValue, "text-green-300")}>{handCount}/8</span>
          </div>
        )}
        <div className={stat}>
          <span className={statLabel}>Deck</span>
          <span className={statValue}>{deckCount}</span>
        </div>
      </div>

    </div>
  );
}