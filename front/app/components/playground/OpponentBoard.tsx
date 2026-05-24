"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface OpponentBoardProps {
  cards: (Card | null)[];
  onPlay?: (cardId: string, targetIndex: number, isOpponent: boolean) => void;
  potentialTargets?: Card[]; // Ajouté pour recevoir les cibles potentielles
}

export default function OpponentBoard({ cards, onPlay, potentialTargets }: OpponentBoardProps) {
  const opponentSlots = Array.from({ length: 8 }, (_, i) => `opponent-${i}`);

  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-blue-300/60 mb-3 uppercase tracking-wider">Poman</h3>

      <div className="grid grid-cols-8 gap-2">
        {opponentSlots.map((slot, index) => (
          <CardSlot
            key={slot}
            id={slot}
            isOpponentSlot={true}
            card={cards[index] ?? undefined}
            isHighlighted={potentialTargets?.some(c => c === cards[index])}
          />
        ))}
      </div>
    </div>
  );
}
