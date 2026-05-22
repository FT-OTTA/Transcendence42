"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerHandProps {
  cards: (Card | null)[];
}

export default function PlayerHand({ cards }: PlayerHandProps) {
  const handSlots = Array.from({ length: 8 }, (_, i) => `hand-${i}`);

  return (
    <div className="border border-green-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-green-300/60 mb-3 uppercase tracking-wider">Your Hand</h3>

      <div className="grid grid-cols-8 gap-2">
        {handSlots.map((slot, index) => (
          <CardSlot key={slot} id={slot} isHand={true} card={cards[index] ?? undefined} />
        ))}
      </div>
    </div>
  );
}
