import clsx from "clsx";
import { Link } from "@/navigation";
import { cinzel } from "@/app/fonts";
const NavItemClass = clsx
(
	cinzel.className,
	"relative py-2 px-4",
	"text-xl",
	"text-blue-300 opacity-60",
	"transition duration-200",
	"hover:text-shadow-[0_0_20px_rgba(255,255,255,0.8)]",
	"hover:text-blue-100 hover:opacity-100",
	"tracking-[0.10em]"
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