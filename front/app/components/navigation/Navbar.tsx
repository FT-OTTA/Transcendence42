"use client";
import NavItem from "./NavItem"
import clsx from "clsx";
import MobileNavbar from "./MobileNavbar"
import {useTranslations} from 'next-intl';
import LanguageSwitcher from "../Language/LanguageSwitcher";
import LoggedInBadge from "../login/LoggedInBadge";


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
	const t = useTranslations('Navbar');
	return (
		<div>
			<div className="hidden md:flex relative z-[9999]">
				<div>
					<nav className={ NavbarClassDesktop }>
						<div >
								<LanguageSwitcher />
						</div>

						<NavItem text={t("home")} href="/" />
						<NavItem text={t("community")} href="/community" />
						<NavItem text={t("lobby")} href="/lobby" />
						
					</nav>
					<div className="flex">
						<LoggedInBadge/>
					</div>
				</div>
			</div>

		<MobileNavbar />

		</div>
	);
}