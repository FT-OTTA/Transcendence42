"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerBoardProps {
  cards: (Card | null)[];
  potentialTargets?: Card[];
  selectedTargets?: Card[];
  onPlay?: (slotIndex: number) => void;
  onClick?: (card: Card) => void;
}

export default function PlayerBoard({ cards, potentialTargets, selectedTargets, onPlay, onClick }: PlayerBoardProps) {
  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-blue-300/60 mb-3 uppercase tracking-wider">You</h3>

      <div className="grid grid-cols-8 gap-2">
        {cards.map((card, index) => (
          <CardSlot
            id ={`player-slot-${index}`}
            key={index}
            card={card ?? undefined}
            // 1. Si on clique sur le slot : 
            // - Si y'a une carte, on tente de la sélectionner (onClick)
            // - Si y'a pas de carte, on tente de poser (onPlay)
            onClick={() => {
                if (card) {
                    onClick?.(card);
                } else {
                    onPlay?.(index);
                }
            }}
            // 2. Logique de surbrillance
            // - Potential: en bleu (ou autre couleur de ciblage)
            // - Selected: en orange (le choix du joueur)
            isHighlighted={potentialTargets?.some(c => c.idInGame === card?.idInGame)}
            isSelected={selectedTargets?.some(c => c.idInGame === card?.idInGame)} // <--- À ajouter dans CardSlot
          />
        ))}
      </div>
    </div>
  );
}