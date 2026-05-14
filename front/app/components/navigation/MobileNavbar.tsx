import MobileNavItem from "./MobileNavItem"
import { useState } from "react";
import clsx from "clsx";

const BurgerButton = clsx
(
	"absolute top-2 right-4",
	"text-blue-200 opacity-70",
	"text-4xl",
	"hover:opacity-100",
	"transition"
)

const MenuBurger = clsx
(
	"fixed inset-0 z-50",
	"overflow-hidden",
	"bg-black/40 backdrop-blur-sm",

	"flex flex-col",
	"justify-center items-end",

	"gap-8",
	"pr-10"
)

export default function MobileNavbar()
{
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="flex md:hidden">
			<button onClick={() => setIsOpen(true)} className={ BurgerButton }>
				☰
			</button>

			{isOpen && (
				<div className={ MenuBurger }>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute top-2 right-4 text-4xl text-blue-200">
						✕
					</button>

					<MobileNavItem text="Home" />
					<MobileNavItem text="Community" />
					<MobileNavItem text="Rooms" />
				</div>
			)}
		</div>
	);
}