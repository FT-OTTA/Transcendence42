"use client";

import React from 'react';
import { useTranslations } from "next-intl";

interface HeroSelectionProps {
  onSelect: (heroId: string) => void;
}

export default function HeroSelection({ onSelect }: HeroSelectionProps) {
  const heroes = [
    { id: 'h001', name: 'Guerrier', description: 'Force brute et armure.' },
    { id: 'h002', name: 'Druide', description: 'Contrôle et magie naturelle.' },
  ];

  const p = useTranslations("Playground");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black/80 text-white p-6">
      <h2 className="text-3xl font-bold mb-8">p("choose_your_heros")</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {heroes.map((hero) => (
          <button
            key={hero.id}
            onClick={() => onSelect(hero.id)}
            className="p-6 border-2 border-white/20 rounded-lg hover:border-blue-500 transition-all bg-white/5 text-left w-64"
          >
            <h3 className="text-xl font-semibold">{hero.name}</h3>
            <p className="text-sm text-gray-400 mt-2">{hero.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}