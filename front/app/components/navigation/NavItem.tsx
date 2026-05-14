import clsx from "clsx";
import Link from "next/link";
import { bellefair } from "@/app/fonts";
const NavItemClass = clsx
(
	bellefair.className,
	"relative px-7 py-1",
	"text-2xl md:text-3xl lg:text-4xl",
	"text-blue-300 opacity-60",
	"transition duration-200",
	"hover:text-shadow-[0_0_20px_rgba(255,255,255,0.8)]",
	"hover:text-blue-100 hover:opacity-100"
)

export type NavItemProps = {
  text: string;
  href: string;
};

export default function NavItem({ text, href }: NavItemProps)
{

	return (
		<Link href={href} className={NavItemClass}>
		  {text}
		</Link>
	);
}