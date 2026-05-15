import clsx from "clsx";
import { cinzel } from "../../fonts"

const startButton = clsx
(
  cinzel.className,
  " relative px-4 py-2 ",
  "text-2xl md:text-3xl lg:text-3xl ",
  "border border-blue-300 bg-transparent text-blue-300",
  "transition duration-300 hover:bg-blue-300",
  "hover:text-blue-950 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
);

type StartButtonProps = {
  setIsLogin: (value: boolean) => void;
};

export default function StartButton({setIsLogin}: StartButtonProps)
{
	return (
	<button className={ startButton } onClick={() => setIsLogin(true)}>
	  - get started -
	</button>
	);
};