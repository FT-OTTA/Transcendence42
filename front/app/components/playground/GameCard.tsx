import clsx from "clsx";
import CardFooter from "./CardFooter";

const CardFrame = clsx (
	"relative",
	"aspect-square w-30",
	"select-none",
	"transition duration-100",
	"opacity-70 hover:opacity-90",
	"bg-black/20 backdrop-blur-sm",
	"hover:-translate-y-1",
)

const titleClass = clsx(
	"absolute top-0.5 left-1/2 -translate-x-1/2",
	"text-sky-300",
	"text-[10px] tracking-tight",
	"z-10",
	"w-[75%]",
	"text-center",
	"truncate whitespace-nowrap overflow-hidden"
);

const costClass = clsx(
	"absolute top-5 left-1",
	"text-sky-200",
	"text-md font-bold",
	"drop-shadow-md",
	"z-10"
);


const runeClass = clsx(
	"absolute inset-0",
	"flex items-center justify-center",
	"z-0"
);

const frameClass = clsx(
	"absolute inset-0 w-full h-full z-20 pointer-events-none"
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

export default function GameCard({
	name,
	cardType,
	cost,
	runeUrl,
	attack,
	defense,
	ability
}: Props)
{

	const frameSrc = {
		creature: "/cardframes/creatureFrame.svg",
		spell: "/cardframes/spellFrame.svg",
		building: "/cardframes/buildingFrame.svg",
	}[cardType];

	return (
		<div className = { CardFrame }>

			<div className={ runeClass }>
				<img
					className="w-20 h-20 object-contain opacity-95"
					src={runeUrl}
					alt={name}
					draggable={false}
				/>
			</div>

			<img
				className={frameClass}
				src={ frameSrc }
				alt=""
				draggable={false}
			/>

			<h2 className={titleClass}>
				{ name }
			</h2>

			<div className={costClass}>
				{ cost }
			</div>
			
			<CardFooter cardType={cardType} attack={attack} defense={defense} ability={ability} />
			
		</div>
	);
}