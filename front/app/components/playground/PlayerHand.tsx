// "use client";

// import CardSlot from "./CardSlot";
// import type { Card } from 'otta-shared-types/card';

// interface PlayerHandProps {
//   cards: (Card | null)[];
//   onClick: (card: Card | null) => void;
// }

// export default function PlayerHand({ cards, onClick }: PlayerHandProps) {
//   const handSlots = Array.from({ length: 8 }, (_, i) => `hand-${i}`);

//   return (
//     <div className="border border-green-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
//       <h3 className="text-sm text-green-300/60 mb-3 uppercase tracking-wider">Your Hand</h3>

//       <div className="grid grid-cols-8 gap-2">
//         {handSlots.map((slot, index) => (
//           <CardSlot key={slot} id={slot} isHand={true} card={cards[index] ?? undefined} onClick={onClick} />
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import CardSlot from "./CardSlot";
import type { Card } from 'otta-shared-types/card';

interface PlayerHandProps {
  cards: (Card | null)[];
  onClick: (card: Card | null) => void;
}

export default function PlayerHand({ cards, onClick }: PlayerHandProps) {
  const realCards = cards.filter(Boolean) as Card[];

  return (
    <div className="border border-green-300 bg-black/30 backdrop-blur-sm rounded-sm p-4">
      <h3 className="text-sm text-green-300/60 mb-3 uppercase tracking-wider">Your Hand ({realCards.length})</h3>

      <div className="overflow-x-auto">
        <div className="flex gap-2" style={{ minWidth: 'max-content' }}>
          {realCards.map((card, index) => (
            <div key={card.idInGame} className="w-20 flex-shrink-0">
              <CardSlot id={`hand-${index}`} isHand={true} card={card} onClick={onClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}