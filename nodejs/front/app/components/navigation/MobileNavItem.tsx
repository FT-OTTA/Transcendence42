import clsx from "clsx";
import Link from "next/link";
import { NavItemProps } from "./NavItem"
import { bellefair } from "@/app/fonts";

const NavItemClass = clsx
(
	bellefair.className,
	"text-4xl text-blue-200",
	"opacity-70 hover:opacity-100",
	"transition",
)

export default function NavItem({ text, href }: NavItemProps)
{

	return (
		<Link href={href} className={NavItemClass}>
		  {text}
		</Link>
	);
}