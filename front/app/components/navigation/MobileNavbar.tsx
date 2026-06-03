'use client'

import MobileNavItem from "./MobileNavItem"
import { useState } from "react";
import clsx from "clsx";
import LoggedInBadge from "../login/LoggedInBadge";
import LanguageSwitcher from "../Language/LanguageSwitcher";
import {useTranslations} from 'next-intl';

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
	const t = useTranslations('Navbar');

	return (
		<div className="flex md:hidden">
			<button onClick={() => setIsOpen(true)} className={ BurgerButton }>
				☰
			</button>

			{isOpen && (
				<div className={ MenuBurger } onClick={() => setIsOpen(false)}>
					<button
						onClick={() => setIsOpen(false)}
						className="absolute top-2 right-4 text-4xl text-blue-200">
						✕
					</button>
					<div 
						onClick={(e) => e.stopPropagation()}
						className="absolute top-2 left-4 text-4xl text-blue-200">
						<LanguageSwitcher />
					</div>
					<div onClick={(e) => e.stopPropagation()}
						className="fixed z-50 overflow-hidden flex flex-col justify-center items-end gap-8"
					>
						<MobileNavItem text={t("home")} href="/" />
						<MobileNavItem text={t("community")} href="/community" />
						<MobileNavItem text={t("lobby")} href="/lobby" />
					</div>
				</div>
			)}
		</div>
	);
}