import Navbar from "../components/navigation/Navbar";
import ProfileSearchBar from "../components/community/ProfileSearchBar";

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
		</main>
	);
}