"use client";
import { useState, useRef } from "react";
import GameCard from "@/app/components/playground/GameCard";

type FloatingNumber = {
  id: number;
  value: string;
  color: string;
  x: number;
  y: number;
};

export default function DevPage() {
  const [animClass, setAnimClass] = useState("");
  const [floats, setFloats] = useState<FloatingNumber[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  function triggerAnim(cls: string) {
    setAnimClass("");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimClass(cls));
    });
  }

  function spawnFloat(value: string, color: string) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const id = nextId.current++;
    setFloats(prev => [...prev, {
      id,
      value,
      color,
      x: rect.left + rect.width / 2,
      y: rect.top,
    }]);
    setTimeout(() => {
      setFloats(prev => prev.filter(f => f.id !== id));
    }, 600);
  }

  return (
    <main className="flex flex-col overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center">

      {/* Floating numbers */}
      {floats.map(f => (
        <div
          key={f.id}
          className={`fixed z-50 pointer-events-none font-bold text-xl ${f.color} animate-fb-float-up`}
          style={{ left: f.x, top: f.y, transform: 'translateX(-50%)' }}
        >
          {f.value}
        </div>
      ))}

      <div className="flex flex-1 items-center justify-center">
        <div ref={cardRef} className={animClass}>
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

      <div className="flex gap-4 justify-center pb-8 flex-wrap px-4">
        <button onClick={() => triggerAnim("animate-fb-play-bottom")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition">
          Play (joueur)
        </button>
        <button onClick={() => triggerAnim("animate-fb-play-top")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition">
          Play (adverse)
        </button>
        <button onClick={() => triggerAnim("animate-fb-combat")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition">
          Combat
        </button>
        <button onClick={() => triggerAnim("animate-fb-death")}
          className="border border-blue-300 px-4 py-2 text-sm text-blue-200 hover:bg-blue-300 hover:text-black transition">
          Death
        </button>
        <button onClick={() => { triggerAnim("animate-fb-combat"); spawnFloat("-3", "text-red-400"); }}
          className="border border-red-400/60 px-4 py-2 text-sm text-red-300 hover:bg-red-400/20 transition">
          Damage -3
        </button>
        <button onClick={() => spawnFloat("+2", "text-sky-300")}
          className="border border-sky-400/60 px-4 py-2 text-sm text-sky-300 hover:bg-sky-400/20 transition">
          Buff +2
        </button>
      </div>
    </main>
  );
}