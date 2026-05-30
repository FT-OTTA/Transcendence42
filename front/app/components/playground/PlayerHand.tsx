"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerHandProps {
  cards: (Card | null)[];
  onClick: (card: Card | null) => void;
  onConfirm: () => void;
}

export default function PlayerHand({ cards, onClick, onConfirm }: PlayerHandProps) {
  const realCards = cards.filter(Boolean) as Card[];
  const [mobilePreview, setMobilePreview] = useState<Card | null>(null);

  return (
    <div className="border border-green-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-green-300/60 mb-3 uppercase tracking-wider">Your Hand ({realCards.length})</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {realCards.map((card, index) => (
            <div key={index} className="w-20 flex-shrink-0">
              <CardSlot
                id={`hand-${index}`}
                isHand={true}
                card={card}
                onClick={() => {
                  setMobilePreview(card);
                  onClick(card);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {mobilePreview && createPortal(
        <div className="md:hidden fixed bottom-12 left-0 right-0 z-40 bg-slate-900/95 border-t border-blue-400/40 px-4 py-2 flex items-center gap-3">
          <div className="w-12 shrink-0">
            <CardSlot id="mobile-preview-hand" card={mobilePreview} onClick={() => setMobilePreview(null)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{mobilePreview.cardName}</p>
            {mobilePreview.effectText && <p className="text-xs text-slate-300 truncate">{mobilePreview.effectText}</p>}
          </div>
          <button onClick={() => {
            onConfirm();
            setMobilePreview(null);
          }} className="shrink-0 border border-green-400 px-3 py-1 text-sm text-green-200 hover:bg-green-400 hover:text-black transition">
            ✓
          </button>
          <button onClick={() => setMobilePreview(null)} className="text-blue-300 px-2">✕</button>
        </div>,
        document.body
      )}
    </div>
  );
}