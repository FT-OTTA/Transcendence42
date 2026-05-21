"use client";

import CardSlot from "./CardSlot";
import type { PlaygroundCard } from "./types";

interface OpponentBoardProps {
  cards: (PlaygroundCard | null)[];
  onPlay?: (cardId: string, targetIndex: number, isOpponent: boolean) => void;
}

export default function OpponentBoard({ cards, onPlay }: OpponentBoardProps) {
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const cardId = e.dataTransfer.getData("cardId");
              if (!cardId) return;
              if (onPlay) onPlay(cardId, index, true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
