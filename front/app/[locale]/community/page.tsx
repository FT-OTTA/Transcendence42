"use client";
import Navbar from "../../components/navigation/Navbar"
import ProfileBanner from "../../components/community/ProfileBanner"
import ProfileStats from "../../components/community/ProfileStats"
import MatchHistory from "../../components/community/MatchHistory"
import ProfileSearchBar from "../../components/community/ProfileSearchBar"
import LoggedInBadge from "../../components/login/LoggedInBadge"
import GameCard from "@/app/components/playground/GameCard";


export default function Community() {
	return (
		<main
			className="
				min-h-screen
				bg-[url('/homepage_bg.png')]
				bg-cover
				bg-center
				flex
				flex-col
			"
		>
			<Navbar />

			<section className="flex-1 flex items-center justify-center px-4">
				<div className="w-full max-w-2xl flex flex-col items-center gap-6">

					<div className="text-center">
						<p className="text-white/50 italic mt-4 text-lg">
							Search for a player profile
						</p>
					</div>

					<div className="w-full">
						<ProfileSearchBar />
					</div>
				</div>
			</section>
			
			<section className="flex-1 flex gap-4 items-center justify-center">
					<GameCard name="Porte-Hache du seigneur du sang" cardType="creature" cost={4} runeUrl="/default_avatar.png" attack={4} defense={2} ability={true}/>
					<GameCard name="Lance Givre" cardType="spell" cost={4} runeUrl="/default_avatar.png" attack={0} defense={0} ability={false}/>
					<GameCard name="Taverne" cardType="building" cost={4} runeUrl="/default_avatar.png" attack={0} defense={8} ability={false}/>
			</section>
		</main>
	);
}