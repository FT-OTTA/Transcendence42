import { Card } from "otta-shared-types/card";
import CardSlot from "./CardSlot";

interface LargeCardViewProps {
  card: Card | null;
  onClick: () => void;
  onConfirm: () => void;
  hasTargets: boolean;
}
export default function LargeCardView({ card, onClick, onConfirm, hasTargets }: LargeCardViewProps) {  return (
    <div className="w-72">
      <CardSlot id="selected-card" card={card} showEffectText onClick={onClick}/>
      {card?.effectText ? (
        <div className="mt-3 rounded-xl bg-slate-950/80 p-3 text-xs leading-5 text-slate-200 ring-1 ring-slate-400/10">
          <h3 className="text-sm font-semibold text-white mb-2">Effect</h3>
          <p>{card.effectText}</p>
        </div>
      ) : null}
      <button
  onClick={onConfirm}
  className="
    group relative w-full mt-4 py-3 px-6 
    bg-gradient-to-r from-emerald-600 to-green-500 
    hover:from-emerald-500 hover:to-green-400 
    active:scale-95 transition-all duration-200 
    rounded-lg shadow-lg shadow-emerald-900/50 
    border border-emerald-400/30 text-white font-bold tracking-wider 
    uppercase text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)]
  " 
>
  Confirm Play
</button>
    </div>
    
  );
}
