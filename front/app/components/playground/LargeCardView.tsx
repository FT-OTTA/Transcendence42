import { Card } from "otta-shared-types/card";
import CardSlot from "./CardSlot";

interface LargeCardViewProps {
  card: Card | null;
  onClick: () => void;
  onConfirm: () => void;
  hasTargets: boolean;
}

export default function LargeCardView({ card, onClick, onConfirm, hasTargets }: LargeCardViewProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex md:flex-col w-72 border border-blue-300/40 bg-slate-950/95 rounded-sm p-3 gap-2">
        <CardSlot id="selected-card" card={card} onClick={() => onClick()} />
        {card?.effectText && (
          <div className="text-xs leading-5 text-slate-200 border-t border-blue-300/20 pt-2">
            <h3 className="text-sm font-semibold text-white mb-1">Effect</h3>
            <p>{card.effectText}</p>
          </div>
        )}
        {card && hasTargets && (
          <button
            onClick={onConfirm}
            className="border border-blue-400 py-1.5 text-sm text-blue-200 hover:bg-blue-400 hover:text-black transition"
          >
            ✓ Confirm
          </button>
        )}
      </div>

      {/* Mobile — bandeau bas */}
      {card && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-blue-400/40 px-4 py-2 flex items-center gap-3">
          <div className="w-12 shrink-0">
            <CardSlot id="selected-card-mobile" card={card} onClick={() => onClick()} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{card.cardName}</p>
            {card.effectText && (
              <p className="text-xs text-slate-300 truncate">{card.effectText}</p>
            )}
          </div>
          {hasTargets && (
            <button
              onClick={onConfirm}
              className="shrink-0 border border-blue-400 px-3 py-1 text-sm text-blue-200 hover:bg-blue-400 hover:text-black transition"
            >
              ✓
            </button>
          )}
        </div>
      )}
    </>
  );
}