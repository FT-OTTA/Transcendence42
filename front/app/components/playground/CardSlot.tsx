"use client";

import type React from 'react';
import type { Card } from 'otta-shared-types/card';

interface CardSlotProps {
  id: string;
  isHand?: boolean;
  isOpponentSlot?: boolean;
  card?: Card;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export default function CardSlot({ id, isHand = false, isOpponentSlot = false, card, onDrop, onDragOver }: CardSlotProps) {
  return (
    <div
      id={id}
      draggable={isHand && Boolean(card)}
      className={`
        aspect-square rounded border transition-all cursor-pointer p-1
        ${isHand
          ? 'border-green-400/60 bg-green-900/20 hover:border-green-300 hover:bg-green-900/40 hover:scale-110 hover:shadow-lg hover:shadow-green-500/50'
          : 'border-blue-300/40 bg-blue-900/20 hover:border-blue-300 hover:bg-blue-900/40'
        }
        ${isOpponentSlot ? 'opacity-80' : ''}
        flex flex-col items-center justify-center text-blue-300/40 text-xs
      `}
      onDragStart={(e) => {
        if (isHand && card) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("cardSlotId", id);
          e.dataTransfer.setData("cardId", card.idInGame.toString());
        }
      }}
      onDragOver={(e) => {
        if (onDragOver) {
          e.preventDefault();
          onDragOver(e);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (onDrop) onDrop(e);
      }}
    >
      {card ? (
        <>
          <span className="text-[9px] text-blue-100/90 leading-tight text-center line-clamp-2">{card.cardName}</span>
          <span className="text-[9px] text-blue-200/70 uppercase mt-0.5">{card.type}</span>
          <span className="text-[10px] text-yellow-200 mt-1">{card.runeCost} R</span>
          {card.currForce !== null && card.currEndurance !== null ? (
            <span className="text-[10px] text-red-200 mt-0.5">{card.currForce}/{card.currEndurance}</span>
          ) : null}
        </>
      ) : (
        <span className="text-[10px] opacity-60">Empty</span>
      )}
    </div>
  );
}
