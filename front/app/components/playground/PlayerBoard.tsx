"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerBoardProps {
  cards: (Card | null)[];
  onPlay?: (slotIndex: number) => void;  // simplifié
}


export default function PlayerBoard({ cards, onPlay }: PlayerBoardProps) {
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
            onClick={() => onPlay?.(index)}
          />
        ))}
      </div>
    </div>
  );
}
