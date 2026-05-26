import { nordic, bellefair } from "../../fonts"
import clsx from "clsx";
import { useTranslations } from "next-intl";

const ScrollHintClass = clsx
(
	"flex flex-col",
	"items-center gap-1",
	"opacity-30 text-white",
	"transition duration-300 hover:opacity-70",
	"pb-15 md:pb-5 lg:pb-5"
);

export default function ScrollHint()
{
	const l = useTranslations("Homepage");

	return (
		<div className={ ScrollHintClass }>
			<h2 className={bellefair.className + " flex text-xl md:text-2xl lg:text-2xl items-center justify-center"}
			>
				{l("whats_otta")};
			</h2>
		
			<div className="w-80 h-[1px] bg-white/50" />

			<button className={nordic.className + " translate-y-2 text-3xl animate-bounce tracking-widest"}>
				V V V
			</button>
		</div>
	);
};