"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerBoardProps {
  cards: (Card | null)[];
  onPlay?: (cardId: number, targetIndex: number, isOpponent: boolean) => void;
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const cardId = e.dataTransfer.getData("cardId");
              if (!cardId) return;
              if (onPlay) onPlay(parseInt(cardId, 10), index, false);
            }}
          />
        ))}
      </div>
    </div>
  );
}
