"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Hero } from "otta-shared-types/hero";
import CardSlot from "./CardSlot";
import LargeCardView from "./LargeCardView";
import type { Card } from 'otta-shared-types/card';

interface OpponentBoardProps {
  cards: (Card | null)[];
  label?: string;
  onPlay?: (cardId: string, targetIndex: number, isOpponent: boolean) => void;
  potentialTargets?: (Card | Hero)[];
  selectedTargets?: (Card | Hero)[];
  onClick?: (card: Card) => void;
}

export default function OpponentBoard({ cards, label="Opponent", onPlay, potentialTargets, selectedTargets, onClick }: OpponentBoardProps) {
  const opponentSlots = Array.from({ length: 8 }, (_, i) => `opponent-${i}`);
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-blue-300/60 mb-3 uppercase tracking-wider">{label}</h3>

      <div className="grid grid-cols-8 gap-2">
        {opponentSlots.map((slot, index) => (
          <div
            key={slot}
            onMouseEnter={(e) => {
              if (!cards[index]) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPos({ x: rect.left, y: rect.bottom + 8 });
              setHoveredCard(cards[index]);
            }}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardSlot
              id={slot}
              isOpponentSlot={true}
              card={cards[index] ?? undefined}
              isHighlighted={potentialTargets?.some(c => c.idInGame === cards[index]?.idInGame)}
              isSelected={selectedTargets?.some(c => c.idInGame === cards[index]?.idInGame)}
              onClick={() => onClick?.(cards[index] as Card)}
            />
          </div>
        ))}
      </div>

      {hoveredCard && createPortal(
        <div
          className="fixed z-[999] pointer-events-none"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          <LargeCardView
            card={hoveredCard}
            onClick={() => {}}
            onConfirm={() => {}}
            hasTargets={false}
          />
        </div>,
        document.body
      )}
    </div>
  );
}