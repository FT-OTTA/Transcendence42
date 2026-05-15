import clsx from "clsx";

const statBox = clsx
(
	"p-2 md:p-4 flex flex-row items-center gap-4 p-2",
	"bg-black/20 backdrop-blur-sm",
	"border border-sky-600/30 rounded-xl",
	"transition duration-300",
	"hover:border-sky-600/40 hover:shadow-[0_0_5px_rgba(100,100,255,0.2)]",
	"text-white/70 hover:text-sky-200",
	"min-w-xs md:min-w-sm"
	
);

const labelClass = clsx
(
	"font-bold text-sm uppercase tracking-wider opacity-70",
)

type StatCardProps = {
	label: string;
	value: string;
};

export default function StatCard({ label, value }: StatCardProps)
{
	return (
		<div className={ statBox }>
			<h1 className={ labelClass }>
				{label}
			</h1>
			<div className="flex-1 h-[1px] bg-sky-700/30" />
			<h2 className="text-2xl md:text-1xl text-sky-400">
				{value}
			</h2>
		</div>
	)
};