"use client";
import Navbar from "../components/navigation/Navbar"
import ProfileBanner from "../components/community/ProfileBanner"
import ProfileStats from "../components/community/ProfileStats"
import MatchHistory from "../components/community/MatchHistory"
import ProfileSearchBar from "../components/community/ProfileSearchBar"


export default function Community()
{

	return (
		<main
		className=" overflow-x-hidden md:overflow-y-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen p-4">
			
			<div className="md:py-5" />
			<Navbar />

			<ProfileSearchBar />
			
			<section>
				<ProfileBanner username="Poman" mood="J'arrive ratale sur le beat, fatale est m..." isOnline={false} />
			</section>

			<section className="h-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-16">
				<ProfileStats />
				<MatchHistory />
			</section>

		</main>
	);
};