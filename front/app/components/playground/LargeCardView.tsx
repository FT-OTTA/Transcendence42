import { Card } from "../../types/card";
import CardSlot from "./CardSlot";

interface LargeCardViewProps {
  card: Card | null;
  onClick: () => void;
  onConfirm: () => void;
  hasTargets: boolean;
}
export default function LargeCardView({ card, onClick, hasTargets }: LargeCardViewProps) {  return (
    <div className="w-72">
    <CardSlot id="selected-card" card={card} showEffectText onClick={() => onClick()}/>      {card?.effectText ? (
        <div className="mt-3 rounded-xl bg-slate-950/80 p-3 text-xs leading-5 text-slate-200 ring-1 ring-slate-400/10">
          <h3 className="text-sm font-semibold text-white mb-2">Effect</h3>
          <p>{card.effectText}</p>
        </div>
      ) : null}
    </div>

  );
}
