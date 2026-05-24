"use client";

interface PlayerStats {
  armor: number;
  dmgDealt: number;
  curRunes: number;
  hand: any[];
  library: any[];
}

interface GameStatsProps {
  turnNumber?: number;
  me?: PlayerStats;
  opponent?: PlayerStats;
  onEndTurn?: () => void;
  highlightPlayerHero?: boolean;
  highlightOpponentHero?: boolean;
}

export default function GameStats({ turnNumber = 1, me, opponent, onEndTurn, highlightPlayerHero = false, highlightOpponentHero = false }: GameStatsProps) {
  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-blue-300 text-center">Game Stats</h3>
      <h4 className="text-md font-medium text-blue-300 text-center">Turn: {turnNumber}/8</h4>

      {/* Opponent Stats */}
      <div className={highlightOpponentHero ? "ring-2 ring-yellow-400/80" : "border-b border-blue-300/30 pb-4"}>
        <h4 className="text-sm text-blue-300/60 uppercase tracking-wider mb-2">Opponent</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200/70">Armor:</span>
            <span className="text-blue-400 font-semibold">{opponent?.armor ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Score:</span>
            <span className="text-red-400 font-semibold">{opponent?.dmgDealt ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Deck:</span>
            <span className="text-blue-400 font-semibold">{opponent?.library.length ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div className={highlightPlayerHero ? "ring-2 ring-green-400/80" : ""}>
        <h4 className="text-sm text-green-300/60 uppercase tracking-wider mb-2">You</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200/70">Hand Cards:</span>
            <span className="text-green-300 font-semibold">{me?.hand.length ?? 0}/8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Armor:</span>
            <span className="text-blue-400 font-semibold">{me?.armor ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Score:</span>
            <span className="text-red-400 font-semibold">{me?.dmgDealt ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Runes:</span>
            <span className="text-yellow-400 font-semibold">{me?.curRunes ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Deck:</span>
            <span className="text-green-300 font-semibold">{me?.library.length ?? 0}</span>
          </div>
        </div>
      </div>

      <button onClick={onEndTurn} className="border border-blue-300 py-2 px-3 text-sm hover:bg-blue-300 hover:text-black transition mt-2">
        End Turn
      </button>
    </div>
  );
}
