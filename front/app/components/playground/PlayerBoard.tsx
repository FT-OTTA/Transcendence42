"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerBoardProps {
  cards: (Card | null)[];
  potentialTargets?: Card[]; // Ajouté pour recevoir les cibles potentielles
  onPlay?: (slotIndex: number) => void;  // simplifié
}


export default function PlayerBoard({ cards, onPlay, potentialTargets }: PlayerBoardProps) {
  const playerSlots = Array.from({ length: 8 }, (_, i) => `player-${i}`);

  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-blue-300/60 mb-3 uppercase tracking-wider">You</h3>

      <div className="grid grid-cols-8 gap-2">
        {playerSlots.map((slot, index) => (
        <CardSlot
            key={slot}
            id={slot}
            card={cards[index] ?? undefined}
            onClick={() => {
                if (!cards[index]) onPlay?.(index)  // ✅ seulement si slot vide
            }}
            isHighlighted={potentialTargets?.some(c => c === cards[index])} // Highlight les slots qui sont des cibles potentielles
        />
        ))}
      </div>
    </div>
  );
}
