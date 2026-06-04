import { nordic } from "../../fonts"
import clsx from "clsx";

const titleClassImg = clsx
(
  "absolute inset-0",
  "bg-[url('/faded_rune.png')]",
  "bg-contain bg-center bg-no-repeat",
  "scale-[2.5]",
  "drop-shadow-[0_0_40px_rgba(120,180,255,0.5)]" 
);

const titleClassTxt = clsx
(
  nordic.className,
  "translate-x-1.5 md:translate-x-3",
  "translate-y-2 md:translate-y-5",
  "cursor-default select-none",
  "text-8xl md:text-[12rem] lg:text-[13rem]",
  "text-blue-200 drop-shadow-[0_0_20px_rgba(100,200,255,0.2)]"
);

export default function HeroTitle()
{
	return (
		<div className="relative inline-block translate-y-25">
			<div className={ titleClassImg } />
			
			<h1 className={ titleClassTxt }>
				<span className="tracking-[0.1em]">OT</span>
				<span className="tracking-[0.15em]">TA</span>
			</h1>

		</div>
	);
}