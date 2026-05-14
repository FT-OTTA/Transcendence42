"use client";
import NavItem from "./NavItem"
import MobileNavItem from "./MobileNavItem"
import clsx from "clsx";
import { useState } from "react";


const NavbarClassDesktop = clsx
(
	"opacity-0 transition duration-300 hover:opacity-100",
	"flex absolute top-0 left-0 w-full items-center justify-center",
	"bg-black/25 backdrop-blur-sm"
)

const BurgerButton = clsx
(
	"absolute top-2 right-4",
	"text-blue-200",
	"opacity-70",
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

const NavLine = clsx
(
	"border border-grey-500",
	"h-[1px] w-[200px]",
	"absolute top-12 left-1/2 -translate-x-1/2",
	"bg-white/25"
)

export default function Navbar()
{
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div>
			{/* display desktop */}
			<div className="hidden md:flex">
				<nav className={ NavbarClassDesktop }>
					<NavItem text="Home" href="/" />
					<NavItem text="Community" href="/community" />
					<NavItem text="Lobby" href="/lobby" />
				</nav>
				<div className={ NavLine }/>
			</div>

			{/* display mobile */}
			<div className="flex md:hidden">
				<button onClick={() => setIsOpen(!isOpen)} className={ BurgerButton }>
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
		</div>
	);
}