"use client";
import { useState } from "react";
import GameCard from "@/app/components/playground/GameCard";

export default function DevPage() {
  const [animClass, setAnimClass] = useState("");

  function triggerAnim(cls: string) {
    setAnimClass(""); // reset d'abord
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimClass(cls));
    });
  }

  return (
    <main className="flex flex-col overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center">
      <div className="flex flex-1 items-center justify-center">
        <div className={animClass}>
          <GameCard
            name="Test"
            cardType="creature"
            cost={6}
            runeUrl="/default_avatar.png"
            attack={6}
            defense={5}
            ability={true}
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center pb-8">
        <button
          onClick={() => triggerAnim("animate-fb-play-bottom")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition"
        >
          Player
        </button>
        <button
          onClick={() => triggerAnim("animate-fb-play-top")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition"
        >
          Opponent
        </button>

		<button
			onClick={() => triggerAnim("animate-fb-combat")}
			className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition"
		>
			bagar
		</button>
		<button
			onClick={() => triggerAnim("animate-fb-death")}
			className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition"
		>
			Death
		</button>
      </div>
    </main>
  );
}