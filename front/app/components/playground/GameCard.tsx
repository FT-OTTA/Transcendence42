import clsx from "clsx";
import CardFooter from "./CardFooter";

const CardFrame = clsx(
  "relative select-none transition duration-100",
  //mobile
  "w-10 h-12",
  "flex flex-col items-center justify-between py-1 px-0.5",
  "bg-black/30 rounded border border-sky-900/60",
  //desktop
  "md:aspect-square md:w-20 md:h-20 lg:w-30 lg:h-30",
  "md:block md:p-0",
  "md:bg-black/20 md:backdrop-blur-sm md:rounded-none md:border-none",
  "md:opacity-70 md:hover:opacity-90 md:hover:-translate-y-1",
);

const titleClass = clsx(
  "hidden",
  "md:block",
  "md:absolute md:top-0 md:left-1/2 md:-translate-x-1/2",
  "text-sky-300 text-[10px] lg:text-[12px] font-semibold",
  "z-10 w-[75%] text-center truncate whitespace-nowrap overflow-hidden"
);

const costClass = clsx(
  "hidden",
  "md:block",
  "md:absolute md:top-3 lg:top-5 md:left-1 lg:left-1.5",
  "text-sky-200 text-sm lg:text-md lg:font-bold",
  "drop-shadow-md z-10"
);

const runeClass = clsx(
  "hidden",
  "md:flex",
  "md:absolute md:inset-0 md:items-center md:justify-center md:z-0"
);

const frameClass = clsx(
  "hidden",
  "md:block",
  "md:absolute md:inset-0 md:w-full md:h-full md:border md:z-20 md:pointer-events-none"
);

type Props = {
  name: string;
  cardType: "creature" | "spell" | "building";
  cost: number;
  runeUrl: string;
  attack?: number;
  defense?: number;
  ability: boolean;
};

export default function GameCard({ name, cardType, cost, runeUrl, attack, defense, ability }: Props) {
  const frameSrc = {
    creature: "/cardframes/creatureFrame.svg",
    spell:    "/cardframes/spellFrame.svg",
    building: "/cardframes/buildingFrame.svg",
  }[cardType];

  return (
    <div className={CardFrame}>

      {/* Mobile uniquement */}
      <span className="text-sky-200 text-[9px] font-bold md:hidden">{cost}R</span>
      <CardFooter cardType={cardType} attack={attack} defense={defense} ability={ability} isMobile />

      {/* md+ : design complet */}
      <div className={runeClass}>
        <img
          className="w-15 h-15 lg:w-20 lg:h-20 object-contain opacity-95"
          src={runeUrl}
          alt=""
          draggable={false}
        />
      </div>
      <img className={frameClass} src={frameSrc} alt="" draggable={false} />
      <h2 className={titleClass}>{name}</h2>
      <div className={costClass}>{cost}</div>
      <CardFooter cardType={cardType} attack={attack} defense={defense} ability={ability} />

    </div>
  );
}