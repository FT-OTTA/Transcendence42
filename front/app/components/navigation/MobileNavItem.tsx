import clsx from "clsx";
import { bellefair } from "@/app/fonts";
const NavItemClass = clsx
(
	bellefair.className,
	"text-3xl text-blue-200",
	"opacity-70 hover:opacity-100",
	"transition py-3",
)

type NavItemProps = {
	text: string;
};

export default function NavItem({ text }: NavItemProps)
{

	return (
		<button className={ NavItemClass }> { text } </button>
	);
}