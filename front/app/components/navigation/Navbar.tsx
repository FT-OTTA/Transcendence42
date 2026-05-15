"use client";
import NavItem from "./NavItem"
import clsx from "clsx";
import MobileNavbar from "./MobileNavbar"


const NavbarClassDesktop = clsx
(
	"opacity-55 transition duration-300 hover:opacity-100",
	"flex absolute top-0 left-0 w-full items-center justify-center",
	"bg-black/25 backdrop-blur-sm",
)

const NavLine = clsx
(
	"border border-grey-900",
	"h-[1px] w-[200px]",
	"absolute top-12 left-1/2 -translate-x-1/2",
	"bg-white/15"
)

export default function Navbar()
{
	return (
		<div>
			<div className="hidden md:flex">
				<nav className={ NavbarClassDesktop }>
					<NavItem text="home" href="/" />
					<NavItem text="community" href="/community" />
					<NavItem text="lobby" href="/lobby" />
				</nav>
				<div className={ NavLine }/>
			</div>

		<MobileNavbar />

		</div>
	);
}