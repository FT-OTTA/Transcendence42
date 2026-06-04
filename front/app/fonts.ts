import { Cinzel, Bellefair, Inter } from "next/font/google";
import localFont from "next/font/local";

export const cinzel = Cinzel({
	subsets: ["latin"],
	weight: ["400", "700"],
});

export const bellefair = Bellefair({
	subsets: ["latin"],
	weight: ["400"],
});

export const nordic = localFont({
	src: "../public/fonts/Nordic.ttf",
});

export const inter = Inter({
	subsets: ["latin"],
});
