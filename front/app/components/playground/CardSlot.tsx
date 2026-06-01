"use client";
import clsx from "clsx";
import type { Card } from 'otta-shared-types/card';
import GameCard from "./GameCard";

interface CardSlotProps {
  id: string;
  isHand?: boolean;
  isOpponentSlot?: boolean;
  showEffectText?: boolean;
  card?: Card | null;
  onClick?: (card: Card | null) => void;
  isHighlighted?: boolean;
  isSelected?: boolean;
}

export default function CardSlot({
  id,
  isHand = false,
  isOpponentSlot = false,
  card,
  onClick,
  isHighlighted = false,
  isSelected = false,
}: CardSlotProps) {

  const wrapperClass = clsx(
    "aspect-square rounded transition-all cursor-pointer",
    isHand && "hover:scale-110",
    isOpponentSlot && "opacity-80",
    isHighlighted && "ring-2 ring-yellow-400/80 scale-105",
    isSelected && "ring-4 ring-orange-500 scale-105 shadow-lg shadow-orange-500/50",
  );

  const emptySlotClass = clsx(
    "aspect-square rounded lg:w-30",
    "bg-sky-300/10 transition-all cursor-pointer",
    "flex items-center justify-center text-xs opacity-60",
  );

  return (
    <div
      id={id}
      onClick={() => onClick?.(card ?? null)}
      className={card ? wrapperClass : emptySlotClass}
    >
      {card ? (
        <GameCard
          name={card.cardName}
          cardType={card.type}
          cost={card.runeCost}
          runeUrl={"/default_avatar.png"}
          attack={card.currForce}
          defense={card.currEndurance}
          ability={card.effects.length > 0}
        />
      ) : (
        <></>
      )}
    </div>
  );
}